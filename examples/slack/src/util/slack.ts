import { WebClient } from "@slack/web-api"
import type { User } from "./index"

/**
 * Slack API utilities with improved performance and error handling
 */

// WebClient pool for reusing connections
class SlackClientPool {
  private clients = new Map<string, WebClient>()
  private lastUsed = new Map<string, number>()
  private readonly maxClients = 50
  private readonly clientTTL = 300000 // 5 minutes

  getClient(token: string): WebClient {
    const now = Date.now()
    
    // Clean up old clients
    this.cleanup(now)
    
    // Return existing client if available
    if (this.clients.has(token)) {
      this.lastUsed.set(token, now)
      return this.clients.get(token)!
    }
    
    // Create new client
    const client = new WebClient(token, {
      retryConfig: {
        retries: 3,
        factor: 2,
      },
      rejectRateLimitedCalls: false,
    })
    
    this.clients.set(token, client)
    this.lastUsed.set(token, now)
    
    return client
  }

  private cleanup(now: number) {
    if (this.clients.size <= this.maxClients) return
    
    // Remove expired clients
    for (const [token, lastUsed] of this.lastUsed.entries()) {
      if (now - lastUsed > this.clientTTL) {
        this.clients.delete(token)
        this.lastUsed.delete(token)
      }
    }
    
    // If still too many, remove oldest
    if (this.clients.size > this.maxClients) {
      const sortedByAge = Array.from(this.lastUsed.entries())
        .sort(([,a], [,b]) => a - b)
      
      const toRemove = sortedByAge.slice(0, this.clients.size - this.maxClients)
      for (const [token] of toRemove) {
        this.clients.delete(token)
        this.lastUsed.delete(token)
      }
    }
  }
}

const clientPool = new SlackClientPool()

// Enhanced error handling
class SlackAPIError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly retryable: boolean = false
  ) {
    super(message)
    this.name = 'SlackAPIError'
  }
}

function validateUser(user: User): void {
  if (!user.accessToken) {
    throw new SlackAPIError("User is not authenticated with Slack", "NO_AUTH")
  }
  if (!user.accessToken.startsWith('xox')) {
    throw new SlackAPIError("Invalid access token format", "INVALID_TOKEN")
  }
}

async function handleSlackResponse<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  try {
    return await operation()
  } catch (error: any) {
    console.error(`Slack API error (${operationName}):`, error)
    
    // Check for specific error types
    if (error.code === 'slack_webapi_rate_limited') {
      throw new SlackAPIError(`Rate limited: ${error.message}`, 'RATE_LIMITED', true)
    }
    if (error.code === 'slack_webapi_request_error') {
      throw new SlackAPIError(`Request error: ${error.message}`, 'REQUEST_ERROR', true)
    }
    
    throw new SlackAPIError(`${operationName} failed: ${error.message}`, 'API_ERROR')
  }
}

/**
 * Send a message to a Slack channel or DM
 * Note: With user tokens, messages are sent as the authenticated user
 */
export async function sendMessage(user: User, channel: string, text: string, thread_ts?: string) {
  validateUser(user)
  
  const client = clientPool.getClient(user.accessToken!)
  
  return handleSlackResponse(async () => {
    const result = await client.chat.postMessage({
      channel,
      text,
      thread_ts,
      as_user: true,  // Send as the authenticated user (required for user tokens)
    })
    
    return {
      success: result.ok,
      message: result.ok ? "Message sent successfully" : `Failed to send message: ${result.error}`,
      ts: result.ts,
      channel: result.channel,
      note: "Message sent as authenticated user (not bot)"
    }
  }, 'sendMessage')
}

/**
 * Get list of conversations (channels, DMs, groups)
 */
export async function getConversations(user: User) {
  console.log("🔧 [slack.ts] getConversations called")
  
  validateUser(user)
  const client = clientPool.getClient(user.accessToken!)
  
  return handleSlackResponse(async () => {
    console.log("🔧 [slack.ts] About to call client.conversations.list...")
    const result = await client.conversations.list({
      types: "public_channel,private_channel,mpim,im",
      limit: 100,
    })
    
    console.log("🔧 [slack.ts] Got response from conversations.list:", { ok: result.ok, channelCount: result.channels?.length })
    
    if (!result.ok) {
      throw new SlackAPIError(`Failed to get conversations: ${result.error}`, 'API_ERROR')
    }
    
    const conversations = result.channels?.map((channel: any) => ({
      id: channel.id,
      name: channel.name || `DM with ${channel.user}`,
      type: channel.is_channel ? 'channel' : 
            channel.is_group ? 'group' : 
            channel.is_mpim ? 'mpim' : 'im',
      is_private: channel.is_private || false,
      is_member: channel.is_member || false,
    })) || []
    
    return {
      success: true,
      conversations,
    }
  }, 'getConversations')
}

/**
 * Get messages from a conversation
 */
export async function getMessages(user: User, channel: string, limit: number = 20) {
  validateUser(user)
  const client = clientPool.getClient(user.accessToken!)
  
  return handleSlackResponse(async () => {
    const result = await client.conversations.history({
      channel,
      limit,
    })
    
    if (!result.ok) {
      throw new SlackAPIError(`Failed to get messages: ${result.error}`, 'API_ERROR')
    }
    
    return {
      success: true,
      messages: result.messages?.map((msg: any) => ({
        ts: msg.ts,
        user: msg.user,
        text: msg.text,
        type: msg.type,
        subtype: msg.subtype,
        thread_ts: msg.thread_ts,
      })) || [],
    }
  }, 'getMessages')
}

/**
 * Get user information
 */
export async function getUserInfo(user: User, userId: string) {
  validateUser(user)
  const client = clientPool.getClient(user.accessToken!)
  
  return handleSlackResponse(async () => {
    const result = await client.users.info({
      user: userId,
    })
    
    if (!result.ok) {
      throw new SlackAPIError(`Failed to get user info: ${result.error}`, 'API_ERROR')
    }
    
    return {
      success: true,
      user: {
        id: result.user?.id,
        name: result.user?.name,
        real_name: result.user?.real_name,
        display_name: result.user?.profile?.display_name,
        email: result.user?.profile?.email,
        is_bot: result.user?.is_bot,
        is_admin: result.user?.is_admin,
        is_owner: result.user?.is_owner,
      },
    }
  }, 'getUserInfo')
}

/**
 * Get conversation information
 */
export async function getConversationInfo(user: User, channel: string) {
  validateUser(user)
  const client = clientPool.getClient(user.accessToken!)
  
  return handleSlackResponse(async () => {
    const result = await client.conversations.info({
      channel,
    })
    
    if (!result.ok) {
      throw new SlackAPIError(`Failed to get conversation info: ${result.error}`, 'API_ERROR')
    }
    
    return {
      success: true,
      channel: {
        id: result.channel?.id,
        name: result.channel?.name,
        purpose: result.channel?.purpose?.value,
        topic: result.channel?.topic?.value,
        is_private: result.channel?.is_private,
        is_archived: result.channel?.is_archived,
        is_member: result.channel?.is_member,
        num_members: result.channel?.num_members,
      },
    }
  }, 'getConversationInfo')
}

/**
 * Search for messages (basic implementation)
 */
export async function searchMessages(user: User, query: string, limit: number = 20) {
  validateUser(user)
  const client = clientPool.getClient(user.accessToken!)
  
  // Note: This uses the search.messages API which requires additional scopes
  return handleSlackResponse(async () => {
    try {
      const result = await client.search.messages({
        query,
        count: limit,
      })
      
      if (!result.ok) {
        // If search doesn't work, return a helpful message
        return {
          success: false,
          message: "Search requires additional scopes. Try using get_messages on specific channels instead.",
          matches: [],
        }
      }
      
      return {
        success: true,
        matches: result.messages?.matches?.map((match: any) => ({
          text: match.text,
          user: match.user,
          ts: match.ts,
          channel: match.channel?.name || match.channel?.id,
        })) || [],
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Search error: ${error.message}. Try using get_messages on specific channels instead.`,
        matches: [],
      }
    }
  }, 'searchMessages')
} 