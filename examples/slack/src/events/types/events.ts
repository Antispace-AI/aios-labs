/**
 * Slack Events API Type Definitions
 * 
 * These types define the structure of webhook requests and events
 * received from Slack's Events API.
 */

// Base webhook request structure
export interface SlackWebhookRequest {
  token: string
  team_id: string
  api_app_id: string
  type: 'url_verification' | 'event_callback'
  challenge?: string  // Only present for url_verification
  event?: SlackEvent  // Only present for event_callback
  event_id?: string   // Only present for event_callback
  event_time?: number // Only present for event_callback
}

// URL verification request
export interface SlackUrlVerificationRequest extends SlackWebhookRequest {
  type: 'url_verification'
  challenge: string
}

// Event callback request
export interface SlackEventCallbackRequest extends SlackWebhookRequest {
  type: 'event_callback'
  event: SlackEvent
  event_id: string
  event_time: number
}

// Base event interface
export interface SlackEvent {
  type: string
  ts: string
  user?: string
  channel?: string
  text?: string
  event_ts?: string
}

// Message events
export interface SlackMessageEvent extends SlackEvent {
  type: 'message'
  channel: string
  user: string
  text: string
  ts: string
  thread_ts?: string
  subtype?: string
  edited?: {
    user: string
    ts: string
  }
}

// Channel marked events (when user reads messages)
export interface SlackChannelMarkedEvent extends SlackEvent {
  type: 'channel_marked'
  channel: string
  ts: string
  user: string
  unread_count?: number
}

// User presence events
export interface SlackPresenceChangeEvent extends SlackEvent {
  type: 'presence_change'
  user: string
  presence: 'active' | 'away'
}

// Channel events
export interface SlackChannelCreatedEvent extends Omit<SlackEvent, 'channel'> {
  type: 'channel_created'
  channel: {
    id: string
    name: string
    created: number
    creator: string
  }
}

// User read state events (for unread count tracking)
export interface SlackGroupMarkedEvent extends SlackEvent {
  type: 'group_marked'
  channel: string
  ts: string
  user: string
  unread_count?: number
}

export interface SlackImMarkedEvent extends SlackEvent {
  type: 'im_marked'
  channel: string
  ts: string
  user: string
  unread_count?: number
}

export interface SlackMpimMarkedEvent extends SlackEvent {
  type: 'mpim_marked'
  channel: string
  ts: string
  user: string
  unread_count?: number
}

// User profile/status events
export interface SlackUserChangeEvent extends Omit<SlackEvent, 'user'> {
  type: 'user_change'
  user: {
    id: string
    name: string
    profile: {
      display_name?: string
      real_name?: string
      status_text?: string
      status_emoji?: string
    }
  }
}

// Channel lifecycle events
export interface SlackChannelDeletedEvent extends Omit<SlackEvent, 'channel'> {
  type: 'channel_deleted'
  channel: string
}

export interface SlackChannelArchiveEvent extends SlackEvent {
  type: 'channel_archive'
  channel: string
  user: string
}

export interface SlackChannelUnarchiveEvent extends SlackEvent {
  type: 'channel_unarchive'
  channel: string
  user: string
}

// App lifecycle events
export interface SlackAppUninstalledEvent extends SlackEvent {
  type: 'app_uninstalled'
}

export interface SlackTokensRevokedEvent extends SlackEvent {
  type: 'tokens_revoked'
  tokens: {
    oauth?: string[]
    bot?: string[]
  }
}

// Union type of all events we handle
export type SupportedSlackEvent = 
  | SlackMessageEvent
  | SlackChannelMarkedEvent
  | SlackGroupMarkedEvent
  | SlackImMarkedEvent
  | SlackMpimMarkedEvent
  | SlackPresenceChangeEvent
  | SlackUserChangeEvent
  | SlackChannelCreatedEvent
  | SlackChannelDeletedEvent
  | SlackChannelArchiveEvent
  | SlackChannelUnarchiveEvent
  | SlackAppUninstalledEvent
  | SlackTokensRevokedEvent

// Event processing metadata
export interface EventProcessingContext {
  event_id: string
  team_id: string
  api_app_id: string
  event_time: number
  received_at: Date
} 