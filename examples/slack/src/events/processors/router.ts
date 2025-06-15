// Event Router - Routes Slack events to appropriate handlers
import { SlackEvent, SlackEventData } from '../types/events'
import { logger } from '../../util/logger'
import { getUser } from '../../util'
import { handleMessageEvent } from './message'
import { handleUserEvent } from './user'

// Event handler registry
type EventHandler = (event: SlackEventData, userId: string) => Promise<void>

const eventHandlers: Record<string, EventHandler> = {
  // Message events
  'message': handleMessageEvent,
  
  // Channel marked events (unread count tracking)
  'channel_marked': handleChannelMarkedEvent,
  'group_marked': handleChannelMarkedEvent,
  'im_marked': handleChannelMarkedEvent,
  'mpim_marked': handleChannelMarkedEvent,
  
  // User events
  'presence_change': handleUserEvent,
  'user_change': handleUserEvent,
  
  // Channel lifecycle events
  'channel_created': handleChannelEvent,
  'channel_deleted': handleChannelEvent,
  'channel_archive': handleChannelEvent,
  'channel_unarchive': handleChannelEvent,
  
  // App lifecycle events
  'app_uninstalled': handleAppUninstalledEvent,
  'tokens_revoked': handleTokensRevokedEvent
}

// Event deduplication cache (in-memory for now, should be Redis in production)
const processedEvents = new Set<string>()
const DEDUP_CACHE_SIZE = 10000
const DEDUP_CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Main event router - routes Slack events to appropriate handlers
 */
export async function routeSlackEvent(
  event: SlackEvent, 
  eventId: string,
  teamId: string,
  eventTime: number
): Promise<void> {
  try {
    // Event deduplication
    if (processedEvents.has(eventId)) {
      logger.info('Event already processed, skipping', { eventId, eventType: event.type })
      return
    }

    // Find user by team_id (OAuth integration)
    const user = await findUserByTeamId(teamId)
    if (!user) {
      logger.warn('No user found for team_id, skipping event', { teamId, eventId, eventType: event.type })
      return
    }

    // Create event data structure
    const eventData: SlackEventData = {
      eventId,
      userId: user.antiId,
      teamId,
      eventType: event.type,
      eventTime,
      event,
      processedAt: new Date().toISOString()
    }

    // Route to appropriate handler
    const handler = eventHandlers[event.type]
    if (!handler) {
      logger.warn('No handler found for event type', { eventType: event.type, eventId })
      return
    }

    // Execute handler
    await handler(eventData, user.antiId)

    // Mark as processed
    addToDeduplicationCache(eventId)

    logger.info('Event processed successfully', { 
      eventType: event.type, 
      eventId, 
      userId: user.antiId 
    })

  } catch (error) {
    logger.error('Error routing Slack event', error instanceof Error ? error : new Error(String(error)), {
      eventId, 
      eventType: event.type,
      teamId
    })
    
    // Re-throw for retry logic in webhook handler
    throw error
  }
}

/**
 * Find user by Slack team_id from OAuth tokens
 */
async function findUserByTeamId(teamId: string): Promise<{ antiId: string } | null> {
  try {
    // Get all users and find one with matching team_id in their Slack tokens
    const users = await getUser('') // This gets all users when called with empty string
    if (!users || !Array.isArray(users)) {
      return null
    }

    for (const user of users) {
      if (user.slackTokens && Array.isArray(user.slackTokens)) {
        const matchingToken = user.slackTokens.find((token: any) => 
          token.team?.id === teamId
        )
        if (matchingToken) {
          return { antiId: user.antiId }
        }
      }
    }

    return null
  } catch (error) {
    logger.error('Error finding user by team_id', error instanceof Error ? error : new Error(String(error)), { teamId })
    return null
  }
}

/**
 * Handle channel marked events (unread count tracking)
 */
async function handleChannelMarkedEvent(eventData: SlackEventData, userId: string): Promise<void> {
  const event = eventData.event as any // Channel marked events have similar structure
  
  logger.info('Processing channel marked event', {
    eventType: eventData.eventType,
    channel: event.channel,
    ts: event.ts,
    unreadCount: event.unread_count,
    userId
  })

  // TODO: Update conversation read state in storage
  // This will be implemented when storage layer is ready
  // await updateConversationReadState(userId, event.channel, event.ts, event.unread_count)
}

/**
 * Handle channel lifecycle events
 */
async function handleChannelEvent(eventData: SlackEventData, userId: string): Promise<void> {
  const event = eventData.event as any
  
  logger.info('Processing channel event', {
    eventType: eventData.eventType,
    channel: event.channel,
    userId
  })

  // TODO: Update channel state in storage
  // This will be implemented when storage layer is ready
  // await updateChannelState(userId, event)
}

/**
 * Handle app uninstalled event
 */
async function handleAppUninstalledEvent(eventData: SlackEventData, userId: string): Promise<void> {
  logger.warn('App uninstalled event received', {
    userId,
    teamId: eventData.teamId,
    eventId: eventData.eventId
  })

  // TODO: Clean up user data and revoke tokens
  // This will be implemented when storage layer is ready
  // await cleanupUserData(userId, eventData.teamId)
}

/**
 * Handle tokens revoked event
 */
async function handleTokensRevokedEvent(eventData: SlackEventData, userId: string): Promise<void> {
  const event = eventData.event as any
  
  logger.warn('Tokens revoked event received', {
    userId,
    teamId: eventData.teamId,
    tokens: event.tokens,
    eventId: eventData.eventId
  })

  // TODO: Update token status in storage
  // This will be implemented when storage layer is ready
  // await revokeUserTokens(userId, eventData.teamId, event.tokens)
}

/**
 * Add event ID to deduplication cache
 */
function addToDeduplicationCache(eventId: string): void {
  processedEvents.add(eventId)
  
  // Simple cache size management (should use Redis with TTL in production)
  if (processedEvents.size > DEDUP_CACHE_SIZE) {
    const oldestEvents = Array.from(processedEvents).slice(0, 1000)
    oldestEvents.forEach(id => processedEvents.delete(id))
  }
}

/**
 * Check if event has been processed (for external use)
 */
export function isEventProcessed(eventId: string): boolean {
  return processedEvents.has(eventId)
}

/**
 * Clear deduplication cache (for testing)
 */
export function clearEventCache(): void {
  processedEvents.clear()
} 