export type MyAppUIActions = {
  run_echo: { textToEcho: string }
}

export type SlackUIActions = {
  send_message: { channel: string; message: string; thread_ts?: string }
  select_conversation: { channel: string }
  refresh_conversations: {}
  refresh_messages: { channel: string }
}
