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
 * CONV-003: getConversationMembers - Phase 2A Implementation
 */
export async function getConversationMembers(
  user: User, 
  conversationId: string,
  limit?: number,
  cursor?: string
): Promise<{ success: boolean, members: any[], nextPageCursor?: string, error?: string }> {
  try {
    console.log('👥 Getting conversation members:', {
      conversationId,
      limit,
      cursor: cursor ? `${cursor.substring(0, 20)}...` : undefined
    })

    validateUserAuth(user)
    const client = clientPool.getClient(user.accessToken!)

    return handleSlackResponse(async () => {
      const result = await client.conversations.members({
        channel: conversationId,
        limit: limit || 100,
        cursor
      })

      if (!result.ok) {
        throw new SlackAPIError(`Failed to get conversation members: ${result.error}`, 'API_ERROR')
      }

      const memberIds = result.members || []

      // Get user details for each member (batch processing for efficiency)
      const members: any[] = []
      
      for (const userId of memberIds) {
        try {
          const userInfo = await client.users.info({ user: userId })
          if (userInfo.ok && userInfo.user) {
            const slackUser = userInfo.user as any
            members.push({
              id: slackUser.id,
              name: slackUser.name,
              real_name: slackUser.real_name,
              display_name: slackUser.profile?.display_name || slackUser.real_name || slackUser.name,
              email: slackUser.profile?.email,
              image_24: slackUser.profile?.image_24,
              image_32: slackUser.profile?.image_32,
              image_48: slackUser.profile?.image_48,
              image_72: slackUser.profile?.image_72,
              image_192: slackUser.profile?.image_192,
              is_bot: slackUser.is_bot,
              is_app_user: slackUser.is_app_user,
              deleted: slackUser.deleted,
              is_restricted: slackUser.is_restricted,
              is_ultra_restricted: slackUser.is_ultra_restricted
            })
          }
        } catch (userError) {
          console.warn(`Failed to get user info for ${userId}:`, userError)
          // Add basic info even if user details fail
          members.push({
            id: userId,
            name: `Unknown User ${userId}`,
            display_name: `Unknown User ${userId}`,
            deleted: false
          })
        }
      }

      console.log(`✅ Retrieved ${members.length} conversation members`)

      return {
        success: true,
        members,
        nextPageCursor: result.response_metadata?.next_cursor
      }

    }, 'getConversationMembers')

  } catch (error) {
    console.error('❌ Failed to get conversation members:', error)
    
    if (error instanceof SlackAPIError) {
      return {
        success: false,
        members: [],
        error: error.message
      }
    }

    return {
      success: false,
      members: [],
      error: `Failed to get conversation members: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * CONV-004: createConversation - Phase 2A Implementation
 */
export async function createConversation(
  user: User,
  name: string,
  isPrivate: boolean,
  memberUserIds?: string
): Promise<{ success: boolean, conversation?: any, error?: string }> {
  try {
    console.log('🆕 Creating conversation:', {
      name,
      isPrivate,
      memberUserIds
    })

    validateUserAuth(user)
    const client = clientPool.getClient(user.accessToken!)

    return handleSlackResponse(async () => {
      const result = await client.conversations.create({
        name,
        is_private: isPrivate
      })

      if (!result.ok) {
        throw new SlackAPIError(`Failed to create conversation: ${result.error}`, 'API_ERROR')
      }

      const conversation = result.channel

      // If member IDs provided and it's a private channel, invite them
      if (memberUserIds && memberUserIds.trim() && conversation?.id) {
        try {
          await client.conversations.invite({
            channel: conversation.id,
            users: memberUserIds // memberUserIds is already a comma-separated string
          })
          console.log(`✅ Invited users to conversation: ${memberUserIds}`)
        } catch (inviteError) {
          console.warn('⚠️ Failed to invite some users:', inviteError)
          // Don't fail the creation if invites fail
        }
      }

      console.log(`✅ Created conversation: ${conversation?.name} (${conversation?.id})`)

      return {
        success: true,
        conversation: {
          id: conversation?.id,
          name: conversation?.name,
          is_private: conversation?.is_private,
          is_member: conversation?.is_member,
          created: conversation?.created,
          creator: conversation?.creator,
          purpose: conversation?.purpose ? {
            value: conversation.purpose.value || '',
            creator: conversation.purpose.creator || '',
            last_set: conversation.purpose.last_set || 0
          } : undefined,
          topic: conversation?.topic ? {
            value: conversation.topic.value || '',
            creator: conversation.topic.creator || '',
            last_set: conversation.topic.last_set || 0
          } : undefined
        }
      }

    }, 'createConversation')

  } catch (error) {
    console.error('❌ Failed to create conversation:', error)
    
    if (error instanceof SlackAPIError) {
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: false,
      error: `Failed to create conversation: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * CONV-009: joinConversation - Phase 2A Implementation
 */
export async function joinConversation(
  user: User,
  channelNameOrId: string
): Promise<{ success: boolean, conversation?: any, error?: string }> {
  try {
    console.log('🔗 Joining conversation:', channelNameOrId)

    validateUserAuth(user)
    const client = clientPool.getClient(user.accessToken!)

    // Handle channel names by removing # if present
    let channelId = channelNameOrId;
    
    // If it's a channel name with #, strip it
    if (channelNameOrId.startsWith('#')) {
      channelNameOrId = channelNameOrId.substring(1);
    }
    
    // If it doesn't look like a channel ID (C followed by alphanumeric),
    // try to find the channel by name
    if (!channelId.match(/^C[A-Z0-9]{8,}$/)) {
      try {
        // Find channel by name
        const listResult = await client.conversations.list({
          types: 'public_channel',
          exclude_archived: true,
          limit: 1000
        });
        
        if (listResult.ok && listResult.channels) {
          const channel = listResult.channels.find(
            c => c.name === channelNameOrId || c.name === channelNameOrId.toLowerCase()
          );
          
          if (channel && channel.id) {
            channelId = channel.id;
            console.log(`🔍 Resolved channel name "${channelNameOrId}" to ID "${channelId}"`);
          } else {
            throw new SlackAPIError(`Could not find channel with name: ${channelNameOrId}`, 'CHANNEL_NOT_FOUND');
          }
        } else {
          throw new SlackAPIError(`Failed to list channels: ${listResult.error}`, 'API_ERROR');
        }
      } catch (error) {
        console.error('❌ Failed to resolve channel name:', error);
        throw error;
      }
    }

    return handleSlackResponse(async () => {
      const result = await client.conversations.join({
        channel: channelId
      })

      if (!result.ok) {
        throw new SlackAPIError(`Failed to join conversation: ${result.error}`, 'API_ERROR')
      }

      console.log(`✅ Successfully joined conversation: ${channelId}`)

      return {
        success: true,
        conversation: result.channel ? {
          id: result.channel.id,
          name: result.channel.name,
          is_private: result.channel.is_private,
          is_member: result.channel.is_member
        } : undefined
      }

    }, 'joinConversation')

  } catch (error) {
    console.error('❌ Failed to join conversation:', error)
    
    if (error instanceof SlackAPIError) {
      if (error.code === 'CHANNEL_NOT_FOUND') {
        return {
          success: false,
          error: `Channel "${channelNameOrId}" not found. Please provide a valid channel name or ID.`
        }
      }
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: false,
      error: `Failed to join conversation: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * CONV-010: leaveConversation - Phase 2A Implementation
 */
export async function leaveConversation(
  user: User,
  channelNameOrId: string
): Promise<{ success: boolean, error?: string }> {
  try {
    console.log('👋 Leaving conversation:', channelNameOrId)

    validateUserAuth(user)
    const client = clientPool.getClient(user.accessToken!)

    // Handle channel names by removing # if present
    let channelId = channelNameOrId;
    
    // If it's a channel name with #, strip it
    if (channelNameOrId.startsWith('#')) {
      channelNameOrId = channelNameOrId.substring(1);
    }
    
    // If it doesn't look like a channel ID (C followed by alphanumeric),
    // try to find the channel by name
    if (!channelId.match(/^C[A-Z0-9]{8,}$/)) {
      try {
        // Find channel by name
        const listResult = await client.conversations.list({
          types: 'public_channel,private_channel',
          exclude_archived: true,
          limit: 1000
        });
        
        if (listResult.ok && listResult.channels) {
          const channel = listResult.channels.find(
            c => c.name === channelNameOrId || c.name === channelNameOrId.toLowerCase()
          );
          
          if (channel && channel.id) {
            channelId = channel.id;
            console.log(`🔍 Resolved channel name "${channelNameOrId}" to ID "${channelId}"`);
          } else {
            throw new SlackAPIError(`Could not find channel with name: ${channelNameOrId}`, 'CHANNEL_NOT_FOUND');
          }
        } else {
          throw new SlackAPIError(`Failed to list channels: ${listResult.error}`, 'API_ERROR');
        }
      } catch (error) {
        console.error('❌ Failed to resolve channel name:', error);
        throw error;
      }
    }

    return handleSlackResponse(async () => {
      const result = await client.conversations.leave({
        channel: channelId
      })

      if (!result.ok) {
        throw new SlackAPIError(`Failed to leave conversation: ${result.error}`, 'API_ERROR')
      }

      console.log(`✅ Successfully left conversation: ${channelId}`)

      return {
        success: true
      }

    }, 'leaveConversation')

  } catch (error) {
    console.error('❌ Failed to leave conversation:', error)
    
    if (error instanceof SlackAPIError) {
      if (error.code === 'CHANNEL_NOT_FOUND') {
        return {
          success: false,
          error: `Channel "${channelNameOrId}" not found. Please provide a valid channel name or ID.`
        }
      }
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: false,
      error: `Failed to leave conversation: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
} 