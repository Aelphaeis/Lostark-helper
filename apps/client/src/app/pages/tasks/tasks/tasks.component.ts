import { Component } from "@angular/core";
import { TasksService } from "../tasks.service";
import { LostarkTask } from "../../../model/lostark-task";
import { TaskFrequency } from "../../../model/task-frequency";
import { TaskScope } from "../../../model/task-scope";
import { FormBuilder, Validators } from "@angular/forms";
import { NzMessageService } from "ng-zorro-antd/message";
import { Clipboard } from "@angular/cdk/clipboard";
import { NzModalService } from "ng-zorro-antd/modal";
import {
  TextQuestionPopupComponent
} from "../../../components/text-question-popup/text-question-popup/text-question-popup.component";
import { filter } from "rxjs/operators";

@Component({
  selector: "lostark-helper-tasks",
  templateUrl: "./tasks.component.html",
  styleUrls: ["./tasks.component.less"]
})
export class TasksComponent {
  public TaskFrequency = TaskFrequency;
  public TaskScope = TaskScope;

  public tasks$ = this.tasksService.tasks$;

  public form = this.fb.group({
    label: ["", Validators.required],
    frequency: [TaskFrequency.DAILY],
    scope: [TaskScope.CHARACTER],
    amount: [null, Validators.required],
    minIlvl: [null, [Validators.required, Validators.min(0), Validators.max(9999)]],
    maxIlvl: [null, [Validators.required, Validators.min(0), Validators.max(9999)]]
  });

  constructor(private tasksService: TasksService,
              private fb: FormBuilder,
              private message: NzMessageService,
              private clipboard: Clipboard,
              private modal: NzModalService) {
  }

  addTask(): void {
    const formData = this.form.getRawValue();
    const task = new LostarkTask(
      formData.label,
      formData.minIlvl,
      formData.frequency,
      formData.scope,
      formData.amount,
      formData.maxIlvl,
      formData.iconPath,
      true,
      true
    );
    this.tasksService.addTask(task);
    this.form.reset({
      frequency: TaskFrequency.DAILY,
      scope: TaskScope.CHARACTER
    });
    this.message.success("Custom task added to the list");
  }

  setTrackAll(track: boolean): void {
    this.tasksService.setTrackAll(track);
  }

  updateTask(task: LostarkTask): void {
    this.tasksService.updateTask(task);
  }

  removeTask(task: LostarkTask): void {
    this.tasksService.removeTask(task);
  }

  saveTask(task: LostarkTask): void {
    this.tasksService.removeTask(task);
  }

  exportTasks(): void {
    this.clipboard.copy(this.tasksService.exportTasks());
    this.message.success("Custom tasks copied to your clipboard");
  }

  importTasks(): void {
    this.modal.create({
      nzTitle: "Import tasks",
      nzContent: TextQuestionPopupComponent,
      nzComponentParams: {
        placeholder: "Paste your exported tasks here"
      },
      nzFooter: null
    }).afterClose
      .pipe(
        filter(Boolean)
      )
      .subscribe((tasksJson) => {
        try {
          this.tasksService.importTasks(JSON.parse(tasksJson || "[]"));
          this.message.success("Custom tasks imported");
        } catch (e: unknown) {
          this.message.error((e as Error).message);
        }
      });
  }

  trackByTask(index: number, task: LostarkTask): string {
    return task.label;
  }
}
