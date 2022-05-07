import { Component, HostListener } from "@angular/core";
import { UserService } from "../../../core/database/services/user.service";
import { RosterService } from "../../../core/database/services/roster.service";
import { CompletionService } from "../../../core/database/services/completion.service";
import { TasksService } from "../../../core/database/services/tasks.service";
import { combineLatest, map, of, pluck, switchMap } from "rxjs";
import { TimeService } from "../../../core/time.service";
import { isTaskDone } from "../../../core/is-task-done";
import { SettingsService } from "../../../core/database/services/settings.service";
import { TaskFrequency } from "../../../model/task-frequency";
import { TaskScope } from "../../../model/task-scope";
import { LostarkTask } from "../../../model/lostark-task";
import { subtasks } from "../subtasks";
import { LostarkTaskWithSubtask } from "../../../model/lostark-task-with-subtask";

@Component({
  selector: "lostark-helper-party-planner",
  templateUrl: "./party-planner.component.html",
  styleUrls: ["./party-planner.component.less"]
})
export class PartyPlannerComponent {
  public TaskFrequency = TaskFrequency;
  public TaskScope = TaskScope;

  public roster$ = this.rosterService.roster$;

  public tasks$ = combineLatest([
    this.tasksService.tasks$,
    this.rosterService.roster$
  ]).pipe(
    map(([tasks, roster]) => {
      return tasks
        .map(task => {
          const taskChildren = subtasks
            .filter(st => st.parentName === task.label);
          if (taskChildren.length === 0) {
            return [task];
          }
          return taskChildren.map((child, i) => {
            return new LostarkTaskWithSubtask(task, child, taskChildren[i + 1]?.minIlvl - 1 || 9999);
          });
        })
        .flat()
        .filter(task => {
          return task.enabled
            && task.shared
            && !task.custom
            && roster.characters.some(c => c.ilvl >= (task.minIlvl || 0) && c.ilvl < task.maxIlvl);
        });
    })
  );

  public display$ = combineLatest([
    this.tasks$,
    this.rosterService.roster$,
    this.completionService.completion$,
    this.timeService.lastDailyReset$,
    this.timeService.lastWeeklyReset$,
    this.settings.settings$.pipe(pluck("lazytracking"))
  ]).pipe(
    switchMap(([tasks, roster, completion, dailyReset, weeklyReset, lazyTracking]) => {
      return this.userService.friendIds$.pipe(
        switchMap(friendIds => {
          if (friendIds.length === 0) {
            return of([]);
          }
          return combineLatest(friendIds.map(friendId => {
            return combineLatest([
              this.rosterService.getOne(friendId),
              this.completionService.getOne(friendId),
              this.settings.getOne(friendId).pipe(
                pluck("lazytracking")
              ),
              this.tasksService.getUserTasks(friendId)
            ]).pipe(
              map(([friendRoster, friendCompletion, friendLazyTracking, friendTasks]) => {
                return {
                  friendId,
                  friendRoster,
                  friendCompletion,
                  friendLazyTracking,
                  friendTasks
                };
              })
            );
          }));
        }),
        map((friendsData) => {
          return tasks.map(task => {
            return {
              task,
              data: roster.characters
                .map(character => {
                  const done = isTaskDone(task, character, completion, dailyReset, weeklyReset, lazyTracking);
                  const canDo = character.ilvl >= (task.minIlvl || 0) && character.ilvl <= task.maxIlvl;
                  if (done === -1 || done >= task.amount || !canDo) {
                    return {
                      task,
                      friends: [],
                      done: done,
                      canDo: canDo
                    };
                  } else {
                    const friendsDisplay = friendsData
                      .map(({ friendId, friendRoster, friendCompletion, friendLazyTracking, friendTasks }) => {
                        const friendTask = friendTasks.find(ft => {
                          return ft.label === task.label
                            && ft.frequency === task.frequency
                            && ft.scope === task.scope
                            && ft.iconPath === task.iconPath
                            && !ft.custom;
                        });
                        if (friendTask) {
                          return {
                            friendId,
                            characters: (friendRoster.characters || [])
                              .filter(c => !c.isPrivate)
                              .filter(fChar => {
                                const fDone = isTaskDone(friendTask, fChar, friendCompletion, dailyReset, weeklyReset, friendLazyTracking);
                                return fDone >= 0 && fDone < task.amount
                                  && fChar.ilvl >= (task.minIlvl || 0) && fChar.ilvl <= task.maxIlvl;
                              })
                              .map(c => {
                                return {
                                  doable: Math.min(
                                    task.amount - isTaskDone(friendTask, c, friendCompletion, dailyReset, weeklyReset, friendLazyTracking),
                                    task.amount - done
                                  ),
                                  c
                                };
                              })
                          };
                        }
                        return { friendId, characters: [] };
                      })
                      .filter(row => row.characters.length > 0);
                    return {
                      task,
                      friends: friendsDisplay,
                      done: done,
                      canDo: true
                    };
                  }
                })
                .flat()
            };
          }).reduce((acc, row) => {
            const frequencyKey = row.task.frequency === TaskFrequency.DAILY ? "daily" : "weekly";
            const scopeKey = row.task.scope === TaskScope.CHARACTER ? "Character" : "Roster";
            return {
              ...acc,
              [`${frequencyKey}${scopeKey}`]: [
                ...acc[`${frequencyKey}${scopeKey}`],
                row
              ]
            };
          }, { dailyCharacter: [], weeklyCharacter: [], dailyRoster: [], weeklyRoster: [] });
        })
      );
    })
  );

  public tableHeight!: number;

  constructor(private userService: UserService, private rosterService: RosterService,
              private completionService: CompletionService, private tasksService: TasksService,
              private timeService: TimeService, private settings: SettingsService) {
    this.setTableHeight();
  }

  @HostListener("window:resize")
  setTableHeight(): void {
    this.tableHeight = window.innerHeight - 64 - 48 - 130;
  }

  trackByEntry(index: number, entry: { task: LostarkTask }): string | undefined {
    return entry.task.$key;
  }

  trackByIndex(index: number): number {
    return index;
  }
}
