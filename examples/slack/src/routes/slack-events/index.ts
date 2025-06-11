import type { Context } from "hono"
import { logger } from "../../util/logger"
import type { SlackWebhookRequest, SlackUrlVerificationRequest, SlackEventCallbackRequest, SupportedSlackEvent, EventProcessingContext } from "../../events/types/events"
import { validateWebhookRequest } from "../../events/webhook/validation"
import { getEventsConfig } from "../../events/config/events"
import { routeSlackEvent, initializeEventHandlers } from "../../events/processors"

/**
 * Slack Events API Webhook Endpoint
 * 
 * This endpoint receives HTTP POST requests from Slack's Events API.
 * It handles user events (not bot events) since the app acts on behalf of users
 * via OAuth tokens, enabling real-time tracking of user activity.
 * 
 * Handles two main types of requests:
 * 1. url_verification - Initial challenge when setting up the webhook
 * 2. event_callback - Actual user events from Slack workspace
 */

// Initialize event handlers when module loads
initializeEventHandlers()
export default async function slackEventsHandler(c: Context) {
  try {
    // Get Events API configuration
    const config = getEventsConfig()
    
    if (!config.enabled) {
      logger.warn('Events API is disabled, rejecting request')
      return c.text('Events API not enabled', 404)
    }

    // Parse the request body
    const body = await c.req.text()
    const request = JSON.parse(body) as SlackWebhookRequest

    // Validate request signature (skip validation for url_verification during initial setup)
    const headers = Object.fromEntries(
      Object.entries(c.req.header()).map(([key, value]) => [key.toLowerCase(), value])
    )
    
    // For url_verification, we can be more lenient with validation
    // since this happens during initial webhook setup
    if (request.type !== 'url_verification') {
      const validation = validateWebhookRequest(headers, body, config.signingSecret)
      
      if (!validation.isValid) {
        logger.warn('Invalid webhook request', { error: validation.error })
        return c.text('Unauthorized', 401)
      }
    }
    
    logger.info('Slack Events API request received', {
      type: request.type,
      team_id: request.team_id,
      api_app_id: request.api_app_id
    })

    // Handle URL verification challenge
    if (request.type === 'url_verification') {
      const verificationRequest = request as SlackUrlVerificationRequest
      logger.info('URL verification challenge received', {
        challenge: verificationRequest.challenge?.substring(0, 10) + '...'
      })
      
      return c.text(verificationRequest.challenge)
    }

    // Handle event callbacks (user events)
    if (request.type === 'event_callback') {
      const eventRequest = request as SlackEventCallbackRequest
      logger.info('User event callback received', {
        event_type: eventRequest.event?.type,
        event_ts: eventRequest.event?.ts,
        user: eventRequest.event?.user,
        channel: eventRequest.event?.channel,
        team_id: eventRequest.team_id
      })

      // Process user event asynchronously
      const context: EventProcessingContext = {
        event_id: eventRequest.event_id,
        team_id: eventRequest.team_id,
        api_app_id: eventRequest.api_app_id,
        event_time: eventRequest.event_time,
        received_at: new Date()
      }

      // Process in background to respond quickly to Slack
      setImmediate(async () => {
        try {
          await routeSlackEvent(eventRequest.event as SupportedSlackEvent, context)
        } catch (error: any) {
          logger.error('Background event processing failed', error, {
            event_id: context.event_id,
            event_type: eventRequest.event?.type
          })
        }
      })
      
      return c.text('OK')
    }

    // Handle unknown event types
    logger.warn('Unknown event type received', {
      type: request.type,
      body: body.substring(0, 200)
    })
    
    return c.text('OK')

  } catch (error: any) {
    logger.error('Error processing Slack Events API request', error)
    
    // Still return 200 to avoid Slack retries for parsing errors
    return c.text('Error', 200)
  }
} 