import { logger } from '../../util/logger'
import type { 
  SupportedSlackEvent, 
  EventProcessingContext,
  SlackMessageEvent,
  SlackChannelMarkedEvent,
  SlackGroupMarkedEvent,
  SlackImMarkedEvent,
  SlackMpimMarkedEvent,
  SlackPresenceChangeEvent,
  SlackUserChangeEvent
} from '../types/events'

/**
 * Event Router
 * 
 * Routes incoming Slack events to appropriate handlers based on event type.
 * Handles event deduplication, user context matching, and error recovery.
 */

// Handler function type
type EventHandler<T extends SupportedSlackEvent> = (
  event: T,
  context: EventProcessingContext
) => Promise<void>

// Registry of event handlers
interface EventHandlerRegistry {
  message?: EventHandler<SlackMessageEvent>
  channel_marked?: EventHandler<SlackChannelMarkedEvent>
  group_marked?: EventHandler<SlackGroupMarkedEvent>
  im_marked?: EventHandler<SlackImMarkedEvent>
  mpim_marked?: EventHandler<SlackMpimMarkedEvent>
  presence_change?: EventHandler<SlackPresenceChangeEvent>
  user_change?: EventHandler<SlackUserChangeEvent>
  // Add more handlers as needed
}

// Global handler registry
const handlerRegistry: EventHandlerRegistry = {}

/**
 * Register an event handler for a specific event type
 */
export function registerEventHandler<T extends SupportedSlackEvent>(
  eventType: T['type'],
  handler: EventHandler<T>
) {
  ;(handlerRegistry as any)[eventType] = handler
  logger.info('Event handler registered', { eventType })
}

/**
 * Set of processed event IDs for deduplication
 * In production, this should be backed by Redis or database
 */
const processedEvents = new Set<string>()

/**
 * Check if an event has already been processed
 */
function isEventProcessed(eventId: string): boolean {
  return processedEvents.has(eventId)
}

/**
 * Mark an event as processed
 */
function markEventProcessed(eventId: string): void {
  processedEvents.add(eventId)
  
  // Clean up old entries to prevent memory leaks
  // In production, use TTL with Redis
  if (processedEvents.size > 10000) {
    const oldEvents = Array.from(processedEvents).slice(0, 1000)
    oldEvents.forEach(id => processedEvents.delete(id))
    logger.debug('Cleaned up old processed events', { cleaned: oldEvents.length })
  }
}

/**
 * Route a Slack event to the appropriate handler
 */
export async function routeSlackEvent(
  event: SupportedSlackEvent,
  context: EventProcessingContext
): Promise<void> {
  const eventLogger = logger

  try {
    // Check for event deduplication
    if (isEventProcessed(context.event_id)) {
      eventLogger.info('Event already processed, skipping', {
        event_id: context.event_id,
        event_type: event.type
      })
      return
    }

    // Validate event has required fields
    if (!event.type || !event.ts) {
      eventLogger.warn('Invalid event: missing required fields', {
        event_type: event.type,
        has_ts: !!event.ts,
        event_id: context.event_id
      })
      return
    }

    // Get handler for this event type
    const handler = (handlerRegistry as any)[event.type]
    
    if (!handler) {
      eventLogger.debug('No handler registered for event type', {
        event_type: event.type,
        event_id: context.event_id
      })
      return
    }

    // Process the event
    eventLogger.info('Processing event', {
      event_type: event.type,
      event_id: context.event_id,
      team_id: context.team_id,
      user: event.user,
      channel: event.channel
    })

    await handler(event, context)

    // Mark as processed only after successful handling
    markEventProcessed(context.event_id)

    eventLogger.info('Event processed successfully', {
      event_type: event.type,
      event_id: context.event_id
    })

  } catch (error: any) {
    eventLogger.error('Error processing event', error, {
      event_type: event.type,
      event_id: context.event_id,
      team_id: context.team_id
    })

    // Don't mark as processed so it can be retried
    throw error
  }
}

/**
 * Get statistics about event processing
 */
export function getEventProcessingStats() {
  return {
    processedEventsCount: processedEvents.size,
    registeredHandlers: Object.keys(handlerRegistry),
    handlerCount: Object.keys(handlerRegistry).length
  }
}

/**
 * Clear processed events cache (for testing)
 */
export function clearProcessedEvents(): void {
  processedEvents.clear()
  logger.debug('Processed events cache cleared')
} 