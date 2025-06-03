/**
 * Application constants
 * Centralizes magic strings and configuration values for better maintainability
 */

// Slack function names
export const SLACK_FUNCTIONS = {
  // Authentication
  GET_AUTH_URL: 'get_auth_url',
  CHECK_AUTH_STATUS: 'check_auth_status', 
  MANUAL_AUTH: 'manual_auth',
  
  // Messaging
  SEND_MESSAGE: 'send_message',
  GET_MESSAGES: 'get_messages',
  
  // Conversations
  LIST_CONVERSATIONS: 'list_conversations',
  GET_CONVERSATION_DETAILS: 'get_conversation_details',
  
  // Search
  SEARCH_MESSAGES: 'search_messages',
  
  // Users
  GET_USER_PROFILE: 'get_user_profile',
  
  // Real-time/Unread
  GET_TOTAL_UNREAD_SUMMARY: 'get_total_unread_summary',
  GET_RECENT_UNREAD_MESSAGES: 'get_recent_unread_messages',
  MARK_CONVERSATION_AS_READ: 'mark_conversation_as_read',
} as const

// UI action names
export const UI_ACTIONS = {
  LOGOUT_SLACK: 'logout_slack',
  CHECK_AUTH_STATUS: 'check_auth_status',
} as const

// Error messages
export const ERROR_MESSAGES = {
  NOT_AUTHENTICATED: 'Not authenticated with Slack',
  MISSING_FUNCTION_NAME: 'Function name is required and must be a non-empty string',
  MISSING_USER_ID: 'User ID is required in meta.user.id',
  UNKNOWN_FUNCTION: 'Unknown function name',
} as const

// Success messages
export const SUCCESS_MESSAGES = {
  AUTH_SUCCESS: 'Successfully authenticated with Slack',
  LOGOUT_SUCCESS: 'Successfully disconnected from Slack',
  MESSAGE_SENT: 'Message sent successfully',
} as const

// OAuth scopes required for the application
export const SLACK_SCOPES = [
  'users:read',
  'channels:read',
  'groups:read', 
  'im:read',
  'mpim:read',
  'channels:history',
  'groups:history',
  'im:history',
  'mpim:history',
  'chat:write',
  'users.profile:read',
] as const 