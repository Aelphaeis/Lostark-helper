import { LostarkTask } from "../model/lostark-task";
import { Character } from "../model/character/character";
import { Completion } from "../model/completion";
import { subDays, subHours } from "date-fns";
import { getCompletionEntry } from "./get-completion-entry-key";
import { TaskFrequency } from "../model/task-frequency";
import { TaskScope } from "../model/task-scope";

export function isTaskDone(task: LostarkTask, character: Character, completion: Completion, dailyReset: number, weeklyReset: number, lazyTracking: Record<string, boolean>): number {
  if (character.lazy && task.scope !== TaskScope.ROSTER) {
    const lazyTrackingFlag = lazyTracking && lazyTracking[`${character.name}:${task.$key}`];
    if (lazyTrackingFlag === undefined || lazyTrackingFlag) {
      dailyReset = subDays(new Date(dailyReset), 2).getTime();
    }
  }
  const currentLADay = subHours(new Date(), 10);
  if (task.daysFilter?.length > 0 && !task.daysFilter?.includes(currentLADay.getUTCDay())) {
    return -1;
  }
  const completionFlag = getCompletionEntry(completion.data, character, task);
  const reset = task.frequency === TaskFrequency.DAILY ? dailyReset : weeklyReset;
  if (!completionFlag) {
    return 0;
  }
  return completionFlag.updated < reset ? 0 : completionFlag.amount;
}
