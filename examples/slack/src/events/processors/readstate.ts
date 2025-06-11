import { logger } from '../../util/logger'
import type { 
  SlackChannelMarkedEvent,
  SlackGroupMarkedEvent, 
  SlackImMarkedEvent,
  SlackMpimMarkedEvent,
  EventProcessingContext 
} from '../types/events'

/**
 * Read State Event Handlers
 * 
 * Process events when users mark conversations as read:
 * - channel_marked: Channel read state updates
 * - group_marked: Group DM read state updates
 * - im_marked: Direct message read state updates  
 * - mpim_marked: Multi-person DM read state updates
 */

/**
 * Handle channel marked as read event
 */
export async function handleChannelMarkedEvent(
  event: SlackChannelMarkedEvent,
  context: EventProcessingContext
): Promise<void> {
  logger.info('Processing channel marked event', {
    channel: event.channel,
    user: event.user,
    ts: event.ts,
    unread_count: event.unread_count,
    event_id: context.event_id
  })

  await updateReadState('channel', event.channel, event.user, event.ts, context)
}

/**
 * Handle group DM marked as read event
 */
export async function handleGroupMarkedEvent(
  event: SlackGroupMarkedEvent,
  context: EventProcessingContext
): Promise<void> {
  logger.info('Processing group marked event', {
    channel: event.channel,
    user: event.user,
    ts: event.ts,
    unread_count: event.unread_count,
    event_id: context.event_id
  })

  await updateReadState('group', event.channel, event.user, event.ts, context)
}

/**
 * Handle direct message marked as read event
 */
export async function handleImMarkedEvent(
  event: SlackImMarkedEvent,
  context: EventProcessingContext
): Promise<void> {
  logger.info('Processing IM marked event', {
    channel: event.channel,
    user: event.user,
    ts: event.ts,
    unread_count: event.unread_count,
    event_id: context.event_id
  })

  await updateReadState('im', event.channel, event.user, event.ts, context)
}

/**
 * Handle multi-person DM marked as read event
 */
export async function handleMpimMarkedEvent(
  event: SlackMpimMarkedEvent,
  context: EventProcessingContext
): Promise<void> {
  logger.info('Processing MPIM marked event', {
    channel: event.channel,
    user: event.user,
    ts: event.ts,
    unread_count: event.unread_count,
    event_id: context.event_id
  })

  await updateReadState('mpim', event.channel, event.user, event.ts, context)
}

/**
 * Common function to update read state for any conversation type
 */
async function updateReadState(
  conversationType: 'channel' | 'group' | 'im' | 'mpim',
  channelId: string,
  userId: string,
  readTimestamp: string,
  context: EventProcessingContext
): Promise<void> {
  try {
    // TODO: Update user's read state in database
    // This will be implemented in Week 3 (State Management)
    
    logger.debug('Would update read state', {
      conversationType,
      channel: channelId,
      user: userId,
      readTimestamp,
      team_id: context.team_id
    })

    // TODO: Update unread count to 0 for this user/channel
    // TODO: Update last read timestamp
    // TODO: Trigger UI updates for this user
    // TODO: Clean up old message notifications

    logger.info('Read state updated successfully', {
      conversationType,
      channel: channelId,
      user: userId
    })

  } catch (error: any) {
    logger.error('Error updating read state', error, {
      conversationType,
      channel: channelId,
      user: userId,
      event_id: context.event_id
    })
    throw error
  }
}

/**
 * Get the conversation type from a channel ID
 * Slack channel IDs have different prefixes:
 * - C: public channels
 * - G: private channels/groups  
 * - D: direct messages
 * - etc.
 */
export function getConversationTypeFromChannelId(channelId: string): string {
  const prefix = channelId.charAt(0)
  
  switch (prefix) {
    case 'C': return 'channel'
    case 'G': return 'group'
    case 'D': return 'im'
    default: return 'unknown'
  }
}

/**
 * Validate that a read timestamp is reasonable
 * (not in the future, not too old)
 */
export function validateReadTimestamp(timestamp: string): boolean {
  try {
    const ts = parseFloat(timestamp)
    const now = Date.now() / 1000
    
    // Check if timestamp is in reasonable range (not future, not more than 1 year old)
    return ts > 0 && ts <= now && ts > (now - 365 * 24 * 60 * 60)
  } catch {
    return false
  }
} 