/**
 * Slack Messaging Module - Phase 1 Implementation
 * Implements: MSG-001, MSG-002
 */

import type { User } from '../index'
import type { 
  SlackMessage,
  MessagesResponse,
  MessageSendResponse
} from './types'
import { validateUserAuth } from './auth'
import { clientPool, handleSlackResponse, SlackAPIError } from './client'

/**
 * MSG-001: Get messages from a conversation, with threading support
 */
export async function getMessages(
  user: User,
  conversationId: string,
  limit?: number,
  cursor?: string,
  oldest?: string,
  latest?: string,
  threadTs?: string
): Promise<MessagesResponse> {
  try {
    console.log('📬 Getting messages:', {
      conversationId,
      limit,
      threadTs: threadTs ? `${threadTs.substring(0, 15)}...` : undefined
    })

    validateUserAuth(user)
    const client = clientPool.getClient(user.accessToken!)

    return handleSlackResponse(async () => {
      const result = await client.conversations.history({
        channel: conversationId,
        limit: limit || 20,
        cursor,
        oldest,
        latest
      })

      if (!result.ok) {
        throw new SlackAPIError(`Failed to get messages: ${result.error}`, 'API_ERROR')
      }

      const messages: SlackMessage[] = result.messages?.map((msg: any) => ({
        ts: msg.ts,
        type: msg.type,
        user: msg.user,
        bot_id: msg.bot_id,
        username: msg.username,
        text: msg.text,
        thread_ts: msg.thread_ts,
        reply_count: msg.reply_count,
        reactions: msg.reactions?.map((reaction: any) => ({
          name: reaction.name,
          users: reaction.users || [],
          count: reaction.count || 0
        })),
        files: msg.files?.map((file: any) => ({
          id: file.id,
          name: file.name,
          title: file.title,
          mimetype: file.mimetype,
          filetype: file.filetype,
          pretty_type: file.pretty_type,
          user: file.user,
          created: file.created,
          timestamp: file.timestamp,
          size: file.size,
          url_private: file.url_private,
          url_private_download: file.url_private_download,
          permalink: file.permalink,
          permalink_public: file.permalink_public
        })),
        blocks: msg.blocks,
        attachments: msg.attachments,
        edited: msg.edited ? {
          user: msg.edited.user,
          ts: msg.edited.ts
        } : undefined,
        deleted_ts: msg.deleted_ts,
        subtype: msg.subtype
      })) || []

      console.log(`✅ Retrieved ${messages.length} messages`)

      return {
        success: true,
        messages,
        hasMore: !!result.has_more,
        nextCursor: result.response_metadata?.next_cursor
      }

    }, 'getMessages')

  } catch (error) {
    console.error('❌ Failed to get messages:', error)
    
    if (error instanceof SlackAPIError) {
      return {
        success: false,
        messages: [],
        error: error.message
      }
    }

    return {
      success: false,
      messages: [],
      error: `Failed to get messages: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * MSG-002: Send a message to a conversation or as a threaded reply
 */
export async function sendMessage(
  user: User,
  conversationId: string,
  text: string,
  blocks?: any[],
  threadTs?: string,
  broadcastToChannel?: boolean
): Promise<MessageSendResponse> {
  try {
    console.log('📤 Sending message:', {
      conversationId,
      textLength: text.length,
      hasBlocks: !!blocks,
      isThreadReply: !!threadTs
    })

    validateUserAuth(user)
    const client = clientPool.getClient(user.accessToken!)

    return handleSlackResponse(async () => {
      const messagePayload: any = {
        channel: conversationId,
        text: text
      }

      if (blocks && blocks.length > 0) {
        messagePayload.blocks = blocks
      }

      if (threadTs) {
        messagePayload.thread_ts = threadTs
        if (broadcastToChannel) {
          messagePayload.reply_broadcast = true
        }
      }

      const result = await client.chat.postMessage(messagePayload)

      if (!result.ok) {
        throw new SlackAPIError(`Failed to send message: ${result.error}`, 'API_ERROR')
      }

      console.log(`✅ Message sent successfully: ${result.ts}`)

      return {
        success: true,
        messageTs: result.ts,
        message: result.message ? {
          ts: result.message.ts,
          type: result.message.type,
          user: result.message.user,
          text: result.message.text,
          thread_ts: result.message.thread_ts,
          blocks: result.message.blocks
        } as SlackMessage : undefined
      }

    }, 'sendMessage')

  } catch (error) {
    console.error('❌ Failed to send message:', error)
    
    if (error instanceof SlackAPIError) {
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: false,
      error: `Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

// Placeholder functions for future phases
export async function updateMessage(): Promise<any> {
  return { success: false, error: 'updateMessage will be implemented in Phase 3' }
}

export async function deleteMessage(): Promise<any> {
  return { success: false, error: 'deleteMessage will be implemented in Phase 3' }
}

export async function sendEphemeralMessage(): Promise<any> {
  return { success: false, error: 'sendEphemeralMessage will be implemented in Phase 3' }
}

export async function getMessagePermalink(): Promise<any> {
  return { success: false, error: 'getMessagePermalink will be implemented in Phase 4' }
} 