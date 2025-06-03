/**
 * Slack Conversations Module - Phase 1 Implementation
 * Implements: CONV-001, CONV-002
 */

import { WebClient } from '@slack/web-api'
import type { User } from '../index'
import type { 
  SlackConversation,
  ConversationsListResponse,
  SlackAPIResponse
} from './types'
import { validateUserAuth } from './auth'
import { clientPool, handleSlackResponse, SlackAPIError } from './client'

/**
 * CONV-001: List conversations (channels, DMs, group DMs) for the user
 */
export async function listConversations(
  user: User,
  types?: string[],
  limit?: number,
  cursor?: string
): Promise<ConversationsListResponse> {
  try {
    console.log('📋 Listing conversations for user:', {
      userId: user.id,
      types: types?.join(','),
      limit,
      cursor: cursor ? `${cursor.substring(0, 20)}...` : undefined
    })

    validateUserAuth(user)
    const client = clientPool.getClient(user.accessToken!)

    return handleSlackResponse(async () => {
      // Default to all conversation types if not specified
      const conversationTypes = types?.join(',') || 'public_channel,private_channel,mpim,im'
      
      const result = await client.conversations.list({
        types: conversationTypes,
        exclude_archived: true,
        limit: limit || 100,
        cursor
      })

      if (!result.ok) {
        throw new SlackAPIError(
          `Failed to list conversations: ${result.error}`, 
          'API_ERROR'
        )
      }

      const conversations: SlackConversation[] = []
      
      // Process conversations and get user info for DMs
      for (const channel of result.channels || []) {
        // Determine conversation type
        let type: 'channel' | 'group' | 'im' | 'mpim'
        if (channel.is_channel) {
          type = 'channel'
        } else if (channel.is_group) {
          type = 'group'
        } else if (channel.is_mpim) {
          type = 'mpim'
        } else {
          type = 'im'
        }

        // Create display name for the conversation
        let displayName: string = channel.name || channel.id || 'Unknown'
        
        if (type === 'im' && channel.user) {
          // For DMs, get the actual user info
          try {
            const userInfo = await client.users.info({ user: channel.user })
            if (userInfo.ok && userInfo.user) {
              const slackUser = userInfo.user as any // Slack API type
              const userName = slackUser.profile?.display_name || slackUser.real_name || slackUser.name || 'Unknown User'
              displayName = `@${userName}`
            } else {
              displayName = `DM with User ${channel.user}`
            }
          } catch (error) {
            console.warn(`Failed to get user info for ${channel.user}:`, error)
            displayName = `DM with User ${channel.user}`
          }
        } else if (type === 'mpim') {
          displayName = channel.name || 'Group DM'
        } else if (type === 'channel' || type === 'group') {
          displayName = `#${channel.name || channel.id || 'Unknown'}`
        }

        // Cast channel to any for Slack API properties
        const channelData = channel as any

        conversations.push({
          id: channel.id || 'unknown',
          name: channel.name,
          display_name: displayName,
          type,
          is_private: channel.is_private || type === 'im' || type === 'mpim',
          is_member: channel.is_member || false,
          is_archived: channel.is_archived || false,
          created: channel.created || 0,
          creator: channel.creator,
          last_read: channelData.last_read,
          unread_count: channelData.unread_count,
          unread_count_display: channelData.unread_count_display,
          num_members: channel.num_members,
          purpose: channel.purpose ? {
            value: channel.purpose.value || '',
            creator: channel.purpose.creator || '',
            last_set: channel.purpose.last_set || 0
          } : undefined,
          topic: channel.topic ? {
            value: channel.topic.value || '',
            creator: channel.topic.creator || '',
            last_set: channel.topic.last_set || 0
          } : undefined
        })
      }

      console.log(`✅ Retrieved ${conversations.length} conversations`, {
        types: conversationTypes,
        hasMore: !!result.response_metadata?.next_cursor,
        breakdown: conversations.reduce((acc, conv) => {
          acc[conv.type] = (acc[conv.type] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      })

      return {
        success: true,
        conversations,
        nextPageCursor: result.response_metadata?.next_cursor
      }

    }, 'listConversations')

  } catch (error) {
    console.error('❌ Failed to list conversations:', error)
    
    if (error instanceof SlackAPIError) {
      return {
        success: false,
        conversations: [],
        error: error.message
      }
    }

    return {
      success: false,
      conversations: [],
      error: `Failed to list conversations: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * CONV-002: getConversationDetails - Get detailed information for a specific conversation
 */
export async function getConversationDetails(user: User, channel: string) {
  validateUserAuth(user)
  const client = clientPool.getClient(user.accessToken!)
  
  return handleSlackResponse(async () => {
    console.log(`🔧 [conversations.ts] Getting conversation details for ${channel}`)
    
    const result = await client.conversations.info({
      channel,
    })
    
    if (!result.ok) {
      throw new SlackAPIError(`Failed to get conversation details: ${result.error}`, 'API_ERROR')
    }
    
    return {
      success: true,
      conversation: {
        id: result.channel?.id,
        name: result.channel?.name,
        is_private: result.channel?.is_private,
        is_member: result.channel?.is_member,
        topic: result.channel?.topic?.value,
        purpose: result.channel?.purpose?.value,
      },
    }
  }, 'getConversationDetails').catch(error => {
    console.error('❌ Failed to get conversation details:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  })
}

/**
 * Helper function to get conversation display name
 * Used internally and can be expanded in future phases
 */
function getConversationDisplayName(conversation: any): string {
  if (conversation.name) {
    return conversation.name
  }
  
  if (conversation.is_im) {
    return `DM with ${conversation.user || 'Unknown User'}`
  }
  
  if (conversation.is_mpim) {
    return 'Group DM'
  }
  
  return conversation.id
}

/**
 * Placeholder for CONV-003: getConversationMembers (Phase 2)
 */
export async function getConversationMembers(
  user: User, 
  conversationId: string
): Promise<any> {
  console.log('🚧 getConversationMembers not yet implemented (Phase 2)')
  return {
    success: false,
    error: 'Function not yet implemented'
  }
} 