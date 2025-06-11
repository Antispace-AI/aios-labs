import { logger } from '../../util/logger'
import { getUser } from '../../util'
import type { SlackMessageEvent, EventProcessingContext } from '../types/events'

/**
 * Message Event Handler
 * 
 * Processes Slack message events to:
 * - Update unread counts for affected users
 * - Handle message edits and deletions
 * - Process threaded messages
 * - Detect user mentions
 * - Store message data for UI components
 */

interface MessageEventData {
  messageId: string
  channelId: string
  userId: string
  text: string
  timestamp: string
  threadTs?: string
  isEdit: boolean
  isDeleted: boolean
  mentions: string[]
}

/**
 * Extract mentions from message text
 */
function extractMentions(text: string): string[] {
  const mentionRegex = /<@([A-Z0-9]+)>/g
  const mentions: string[] = []
  let match

  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1])
  }

  return mentions
}

/**
 * Determine if this is an edit or deletion event
 */
function analyzeMessageEvent(event: SlackMessageEvent): { isEdit: boolean; isDeleted: boolean } {
  return {
    isEdit: !!event.edited,
    isDeleted: event.subtype === 'message_deleted'
  }
}

/**
 * Process a message event and update relevant state
 */
export async function handleMessageEvent(
  event: SlackMessageEvent, 
  context: EventProcessingContext
): Promise<void> {
  const messageLogger = logger

  try {
    messageLogger.info('Processing message event', {
      channel: event.channel,
      user: event.user,
      has_thread: !!event.thread_ts,
      subtype: event.subtype,
      event_id: context.event_id
    })

    // Extract event data
    const { isEdit, isDeleted } = analyzeMessageEvent(event)
    const mentions = extractMentions(event.text || '')

    const messageData: MessageEventData = {
      messageId: event.ts,
      channelId: event.channel,
      userId: event.user,
      text: event.text || '',
      timestamp: event.ts,
      threadTs: event.thread_ts,
      isEdit,
      isDeleted,
      mentions
    }

    // Process the message based on type
    if (isDeleted) {
      await handleMessageDeletion(messageData, context)
    } else if (isEdit) {
      await handleMessageEdit(messageData, context)
    } else {
      await handleNewMessage(messageData, context)
    }

    messageLogger.info('Message event processed successfully', {
      messageId: messageData.messageId,
      channel: messageData.channelId,
      isEdit,
      isDeleted,
      mentionCount: mentions.length
    })

  } catch (error: any) {
    messageLogger.error('Error processing message event', error, {
      channel: event.channel,
      user: event.user,
      event_id: context.event_id
    })
    throw error
  }
}

/**
 * Handle a new message (increment unread counts)
 */
async function handleNewMessage(
  messageData: MessageEventData, 
  context: EventProcessingContext
): Promise<void> {
  logger.info('Processing new message', {
    channel: messageData.channelId,
    user: messageData.userId,
    isThread: !!messageData.threadTs,
    mentions: messageData.mentions.length
  })

  // TODO: Implement unread count updates
  // This will be implemented in Week 3 (State Management)
  
  // For now, just log the intent
  logger.debug('Would update unread counts for channel', {
    channel: messageData.channelId,
    sender: messageData.userId,
    team_id: context.team_id
  })

  // TODO: Store message for UI components
  // TODO: Update conversation last activity timestamp
  // TODO: Handle mention notifications
  // TODO: Update thread unread counts if applicable
}

/**
 * Handle message edit (update stored message data)
 */
async function handleMessageEdit(
  messageData: MessageEventData,
  context: EventProcessingContext  
): Promise<void> {
  logger.info('Processing message edit', {
    channel: messageData.channelId,
    messageId: messageData.messageId,
    user: messageData.userId
  })

  // TODO: Update stored message content
  // TODO: Preserve edit history
  // TODO: Update mention tracking if mentions changed
  
  logger.debug('Would update message content', {
    messageId: messageData.messageId,
    channel: messageData.channelId,
    newMentions: messageData.mentions.length
  })
}

/**
 * Handle message deletion (clean up data)
 */
async function handleMessageDeletion(
  messageData: MessageEventData,
  context: EventProcessingContext
): Promise<void> {
  logger.info('Processing message deletion', {
    channel: messageData.channelId,
    messageId: messageData.messageId,
    user: messageData.userId
  })

  // TODO: Remove message from storage
  // TODO: Adjust unread counts if necessary
  // TODO: Clean up mention notifications
  
  logger.debug('Would remove message from storage', {
    messageId: messageData.messageId,
    channel: messageData.channelId
  })
}

/**
 * Get affected users for unread count updates
 * This includes all users who have access to the channel
 */
async function getAffectedUsers(
  channelId: string, 
  teamId: string
): Promise<string[]> {
  // TODO: Implement proper user lookup based on channel membership
  // For now, return empty array
  
  logger.debug('Would fetch channel members for unread updates', {
    channel: channelId,
    team_id: teamId
  })
  
  return []
}

/**
 * Helper function to determine if a user should receive unread count updates
 * (e.g., don't count messages sent by the user themselves)
 */
function shouldUpdateUnreadForUser(userId: string, senderId: string): boolean {
  return userId !== senderId
} 