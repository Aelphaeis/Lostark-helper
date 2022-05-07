import { DataModel } from "./data-model";
import { from, map, Observable, shareReplay } from "rxjs";
import {
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  docData,
  DocumentData,
  DocumentReference,
  Firestore,
  FirestoreDataConverter,
  query,
  QueryDocumentSnapshot,
  runTransaction,
  setDoc,
  Transaction,
  UpdateData,
  updateDoc,
  WithFieldValue,
  WriteBatch,
  writeBatch
} from "@angular/fire/firestore";
import { QueryConstraint } from "@firebase/firestore";

export abstract class FirestoreStorage<T extends DataModel> {

  protected converter: FirestoreDataConverter<T> = {
    toFirestore(modelObject: WithFieldValue<T>): DocumentData {
      const workingCopy: Partial<WithFieldValue<T>> = { ...modelObject } as Partial<WithFieldValue<T>>;
      delete workingCopy.$key;
      delete workingCopy.notFound;
      Object.entries(workingCopy)
        .forEach(([key, value]) => {
          if (value === undefined) {
            delete workingCopy[key];
          }
        });
      return workingCopy as T;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot): T {
      return {
        $key: snapshot.id,
        ...snapshot.data()
      } as T;
    }
  };

  protected cache: Record<string, Observable<T>> = {};

  protected readonly collection = collection(this.firestore, this.getCollectionName()).withConverter(this.converter);

  protected constructor(protected firestore: Firestore) {
  }

  protected docRef(key: string): DocumentReference<T> {
    return doc(this.firestore, this.getCollectionName(), key).withConverter(this.converter);
  }

  public query(filterQuery: QueryConstraint): Observable<T[]> {
    return collectionData(query(this.collection, filterQuery).withConverter(this.converter));
  }

  public getOne(key: string): Observable<T> {
    if (!this.cache[key]) {
      this.cache[key] = docData(this.docRef(key)).pipe(
        map(res => {
          if (!res) {
            return {
              $key: key,
              notFound: true
            } as T;
          }
          return res;
        }),
        shareReplay(1)
      );
    }
    return this.cache[key];
  }

  public addOne(row: Omit<T, "$key">): Observable<string> {
    return from(addDoc(this.collection, row)).pipe(
      map(ref => ref.id)
    );
  }

  public deleteOne(key: string): Observable<void> {
    return from(deleteDoc(this.docRef(key)));
  }

  public setOne(key: string, row: Omit<T, "$key" | "notFound">): Observable<void> {
    return from(setDoc(this.docRef(key), row));
  }

  public updateOne(key: string, row: UpdateData<T>): Observable<void> {
    return from(updateDoc(this.docRef(key), row));
  }

  protected transaction<R>(transaction: (t: Transaction) => Promise<R>): Observable<R> {
    return from(runTransaction(this.firestore, transaction));
  }

  protected batch(): WriteBatch {
    return writeBatch(this.firestore);
  }

  protected abstract getCollectionName(): string;
}
