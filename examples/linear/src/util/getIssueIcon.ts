export enum StateType {
  triage = "triage",
  backlog = "backlog",
  unstarted = "unstarted",
  started = "started",
  completed = "completed",
  canceled = "canceled",
}

export const statusIcons: Record<string, string> = {
  [StateType.triage]: "triage.svg",
  [StateType.backlog]: "backlog.svg",
  [StateType.unstarted]: "unstarted.svg",
  [StateType.started]: "started.svg",
  [StateType.completed]: "completed.svg",
  [StateType.canceled]: "canceled.svg",
}

export type StatusIcon = ReturnType<typeof getStatusIcon>

export function getStatusIcon(state: { type: string; color: string }) {
  return {
    source: statusIcons[state.type],
    tintColor: state.color,
  }
}
