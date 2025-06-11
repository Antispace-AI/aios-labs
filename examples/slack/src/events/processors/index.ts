import { logger } from '../../util/logger'
import { registerEventHandler } from './router'
import { handleMessageEvent } from './message'
import { 
  handleChannelMarkedEvent,
  handleGroupMarkedEvent,
  handleImMarkedEvent,
  handleMpimMarkedEvent
} from './readstate'

/**
 * Event Processor Module
 * 
 * This module registers all event handlers and provides a unified
 * interface for processing Slack events.
 */

/**
 * Initialize all event handlers
 * This should be called once when the application starts
 */
export function initializeEventHandlers(): void {
  logger.info('Initializing Slack event handlers...')

  // Message events
  registerEventHandler('message', handleMessageEvent)

  // Read state events  
  registerEventHandler('channel_marked', handleChannelMarkedEvent)
  registerEventHandler('group_marked', handleGroupMarkedEvent)
  registerEventHandler('im_marked', handleImMarkedEvent)
  registerEventHandler('mpim_marked', handleMpimMarkedEvent)

  // TODO: Add more handlers as needed
  // registerEventHandler('presence_change', handlePresenceChangeEvent)
  // registerEventHandler('user_change', handleUserChangeEvent)
  // registerEventHandler('channel_created', handleChannelCreatedEvent)

  logger.info('Event handlers initialized successfully', {
    handlerCount: 5
  })
}

// Re-export router functions for external use
export { routeSlackEvent, getEventProcessingStats } from './router' 