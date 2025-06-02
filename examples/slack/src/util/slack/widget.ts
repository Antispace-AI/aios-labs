import { WebClient } from "@slack/web-api"
import type { User } from "../index"

/**
 * Widget-specific Slack functions for unread counts and recent messages
 */

export interface UnreadCount {
  total: number;
  breakdown: {
    dms: number;
    channels: number;
    mentions: number;
  };
  error?: string;
}

export interface RecentUnreadMessage {
  id: string;
  conversation_id: string;
  conversation_name: string;
  sender_name: string;
  text_preview: string;
  timestamp: string;
  message_type: 'dm' | 'channel' | 'group';
  is_mention: boolean;
  is_urgent: boolean;
}

export interface RecentUnreadMessages {
  messages: RecentUnreadMessage[];
  total_unread: number;
  error?: string;
}

/**
 * Get total unread count across all conversations
 */
export async function getTotalUnreadCount(user: User): Promise<UnreadCount> {
  try {
    console.log("🔢 Getting total unread count for user")
    
    const client = new WebClient(user.accessToken)
    
    // ALTERNATIVE APPROACH: Try getting counts via different method
    try {
      console.log("🔍 Trying alternative unread counting method...")
      // Note: users.counts might not be available in web API, let's use conversations approach
      console.log("📊 Will compare with individual conversation checks...")
    } catch (countsError) {
      console.log("❌ Alternative counting method not available:", countsError)
    }
    
    // Get all conversations
    const conversationsResult = await client.conversations.list({
      types: "public_channel,private_channel,mpim,im",
      exclude_archived: true,
      limit: 1000
    })

    if (!conversationsResult.ok || !conversationsResult.channels) {
      throw new Error("Failed to fetch conversations")
    }

    console.log(`📊 Found ${conversationsResult.channels.length} total conversations to process`)

    let total = 0
    let dms = 0
    let channels = 0
    let mentions = 0
    let processedCount = 0
    let skippedCount = 0
    let errorCount = 0

    // Track detailed conversation info for debugging
    const conversationDetails: Array<{
      id: string;
      name: string;
      type: string;
      unread_count: number;
      unread_count_display: number;
      categorized_as: string;
    }> = []

    // Process each conversation to get unread counts
    for (const conversation of conversationsResult.channels) {
      if (!conversation.id) {
        skippedCount++
        console.log(`⚠️ Skipping conversation without ID`)
        continue
      }

      try {
        console.log(`🔍 Processing conversation: ${conversation.id} (${conversation.name || 'unnamed'})`)
        
        // Get conversation info with unread count
        const convInfo = await client.conversations.info({
          channel: conversation.id
        })

        if (convInfo.ok && convInfo.channel) {
          const channel = convInfo.channel as any // Type assertion for extended properties
          let unreadCount = channel.unread_count || 0
          let unreadCountDisplay = channel.unread_count_display || 0
          
          // DEBUG: Log the full channel object for channels to see what we're getting
          if (!conversation.is_im && unreadCount === 0) {
            console.log(`🔬 DEBUG CHANNEL API RESPONSE for ${conversation.name}:`)
            console.log(`   - Raw unread_count: ${channel.unread_count} (type: ${typeof channel.unread_count})`)
            console.log(`   - Raw unread_count_display: ${channel.unread_count_display} (type: ${typeof channel.unread_count_display})`)
            console.log(`   - is_member: ${channel.is_member}`)
            console.log(`   - last_read: ${channel.last_read}`)
            console.log(`   - Available fields: ${Object.keys(channel).filter(k => k.includes('unread') || k.includes('count') || k.includes('read')).join(', ')}`)
            
            // Check if we're not a member - this might explain why unread count is 0
            if (!channel.is_member) {
              console.log(`   ⚠️ NOT A MEMBER of ${conversation.name} - this explains why unread_count is 0`)
            } else if (channel.last_read) {
              console.log(`   🔄 TRYING MANUAL COUNT for ${conversation.name} using last_read: ${channel.last_read}`)
              
              // For channels where user is a member, manually count unread messages
              try {
                const historyResult = await client.conversations.history({
                  channel: conversation.id,
                  oldest: channel.last_read,
                  limit: 100,
                  inclusive: false // Don't include the last read message
                })
                
                if (historyResult.ok && historyResult.messages) {
                  const unreadMessages = historyResult.messages.filter(msg => 
                    msg.type === 'message' && 
                    msg.ts && 
                    parseFloat(msg.ts) > parseFloat(channel.last_read)
                  )
                  
                  unreadCount = unreadMessages.length
                  
                  // Count mentions in unread messages
                  const mentionMessages = unreadMessages.filter(msg => 
                    msg.text && msg.text.includes(`<@${user.id}>`)
                  )
                  unreadCountDisplay = mentionMessages.length
                  
                  console.log(`   ✅ MANUAL COUNT RESULT: ${unreadCount} unread, ${unreadCountDisplay} mentions`)
                  
                  if (unreadCount > 100) {
                    console.log(`   ⚠️ Channel has 100+ unread messages (limit reached), actual count may be higher`)
                  }
                } else {
                  console.log(`   ❌ Failed to get history for manual count: ${historyResult.error}`)
                }
              } catch (historyError) {
                console.error(`   ❌ Error in manual count for ${conversation.name}:`, historyError)
              }
            }
          }
          
          // Determine conversation type for categorization
          let conversationType = 'unknown'
          let categorizedAs = 'none'
          
          if (conversation.is_im) {
            conversationType = 'dm'
            if (unreadCount > 0) {
              dms += unreadCount
              categorizedAs = 'dm'
            }
          } else if (conversation.is_group || conversation.is_mpim) {
            conversationType = 'group'
            if (unreadCount > 0) {
              channels += unreadCount // Groups count as channels for our purposes
              categorizedAs = 'channel'
            }
          } else {
            conversationType = 'channel'
            if (unreadCount > 0) {
              channels += unreadCount
              categorizedAs = 'channel'
            }
          }
          
          if (unreadCount > 0) {
            total += unreadCount
            
            // Check for mentions (unread_count_display indicates mentions/highlights)
            if (unreadCountDisplay > 0) {
              mentions += unreadCountDisplay
            }

            console.log(`📨 UNREAD: ${conversation.name || conversation.id} (${conversationType})`)
            console.log(`   - Unread count: ${unreadCount}`)
            console.log(`   - Unread display: ${unreadCountDisplay}`)
            console.log(`   - Categorized as: ${categorizedAs}`)
            console.log(`   - Is IM: ${conversation.is_im}`)
            console.log(`   - Is Group: ${conversation.is_group}`)
            console.log(`   - Is MPIM: ${conversation.is_mpim}`)
          } else {
            console.log(`✅ No unread: ${conversation.name || conversation.id} (${conversationType})`)
          }

          // Store detailed info for summary
          conversationDetails.push({
            id: conversation.id,
            name: conversation.name || conversation.id,
            type: conversationType,
            unread_count: unreadCount,
            unread_count_display: unreadCountDisplay,
            categorized_as: categorizedAs
          })

          processedCount++
        } else {
          console.warn(`❌ Failed to get conversation info for ${conversation.id}: ${convInfo.error}`)
          errorCount++
        }
      } catch (convError: any) {
        console.error(`❌ Error processing conversation ${conversation.id}:`, convError.message)
        errorCount++
        // Continue processing other conversations
      }
    }

    // Log detailed summary
    console.log(`\n📈 UNREAD COUNT SUMMARY:`)
    console.log(`   Total conversations found: ${conversationsResult.channels.length}`)
    console.log(`   Successfully processed: ${processedCount}`)
    console.log(`   Skipped (no ID): ${skippedCount}`)
    console.log(`   Errors: ${errorCount}`)
    console.log(`   \n💬 UNREAD BREAKDOWN:`)
    console.log(`   Total unread: ${total}`)
    console.log(`   DMs: ${dms}`)
    console.log(`   Channels/Groups: ${channels}`)
    console.log(`   Mentions: ${mentions}`)

    // Log conversations with unread messages
    const unreadConversations = conversationDetails.filter(c => c.unread_count > 0)
    if (unreadConversations.length > 0) {
      console.log(`\n📋 CONVERSATIONS WITH UNREAD MESSAGES (${unreadConversations.length}):`)
      unreadConversations.forEach(conv => {
        console.log(`   ${conv.name} (${conv.type}): ${conv.unread_count} unread, ${conv.unread_count_display} display, categorized as: ${conv.categorized_as}`)
      })
    }

    // Log potential issues
    const potentialIssues: string[] = []
    if (mentions > total) {
      potentialIssues.push(`Mentions (${mentions}) > Total (${total}) - This shouldn't happen`)
    }
    if (dms + channels !== total) {
      potentialIssues.push(`DMs (${dms}) + Channels (${channels}) = ${dms + channels} ≠ Total (${total})`)
    }
    if (errorCount > 0) {
      potentialIssues.push(`${errorCount} conversations had errors`)
    }

    if (potentialIssues.length > 0) {
      console.log(`\n⚠️ POTENTIAL ISSUES DETECTED:`)
      potentialIssues.forEach(issue => console.log(`   - ${issue}`))
    }

    console.log(`✅ Final totals - Total: ${total} (DMs: ${dms}, Channels: ${channels}, Mentions: ${mentions})`)

    return {
      total,
      breakdown: {
        dms,
        channels,
        mentions
      }
    }

  } catch (error: any) {
    console.error("❌ Error getting total unread count:", error)
    console.error("❌ Full error details:", {
      message: error.message,
      code: error.code,
      data: error.data,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
    return {
      total: 0,
      breakdown: { dms: 0, channels: 0, mentions: 0 },
      error: error.message || "Failed to get unread count"
    }
  }
}

/**
 * Get recent unread messages for widget preview
 */
export async function getRecentUnreadMessages(
  user: User, 
  limit: number = 3
): Promise<RecentUnreadMessages> {
  try {
    console.log(`📨 Getting ${limit} recent unread messages for widget`)
    
    const client = new WebClient(user.accessToken)
    const recentMessages: RecentUnreadMessage[] = []
    let totalUnread = 0

    // Get all conversations with unread messages
    const conversationsResult = await client.conversations.list({
      types: "public_channel,private_channel,mpim,im",
      exclude_archived: true,
      limit: 1000
    })

    if (!conversationsResult.ok || !conversationsResult.channels) {
      throw new Error("Failed to fetch conversations")
    }

    // Collect unread messages from all conversations
    const messagePromises = conversationsResult.channels
      .filter(conv => conv.id && ((conv as any).unread_count || 0) > 0)
      .map(async (conversation) => {
        try {
          const convInfo = await client.conversations.info({
            channel: conversation.id!
          })

          if (!convInfo.ok || !convInfo.channel) return []

          const channel = convInfo.channel as any
          totalUnread += channel.unread_count || 0

          // Get recent messages from this conversation
          const historyResult = await client.conversations.history({
            channel: conversation.id!,
            limit: 5,
            inclusive: true
          })

          if (!historyResult.ok || !historyResult.messages) return []

          // Process messages and find unread ones
          const messages = historyResult.messages
            .filter(msg => msg.type === 'message' && msg.text && msg.user)
            .slice(0, 2) // Take up to 2 recent messages per conversation
            .map(msg => {
              const isImportant = conversation.is_im || 
                                 (msg.text && msg.text.includes(`<@${user.id}>`))

              return {
                id: msg.ts || '',
                conversation_id: conversation.id!,
                conversation_name: getConversationDisplayName(conversation),
                sender_name: msg.user || 'Unknown',
                text_preview: (msg.text || '').substring(0, 50),
                timestamp: msg.ts || '',
                message_type: conversation.is_im ? 'dm' : 
                             conversation.is_group ? 'group' : 'channel',
                is_mention: msg.text ? msg.text.includes(`<@${user.id}>`) : false,
                is_urgent: isImportant,
                _timestamp_num: parseFloat(msg.ts || '0') // For sorting
              } as RecentUnreadMessage & { _timestamp_num: number }
            })

          return messages

        } catch (error) {
          console.warn(`Failed to get messages for conversation ${conversation.id}:`, error)
          return []
        }
      })

    // Wait for all conversations to be processed
    const allMessages = (await Promise.all(messagePromises)).flat()

    // Sort by timestamp (most recent first) and take top N
    const sortedMessages = allMessages
      .sort((a, b) => (b as any)._timestamp_num - (a as any)._timestamp_num)
      .slice(0, limit)
      .map(msg => {
        const { _timestamp_num, ...cleanMsg } = msg as any
        return cleanMsg as RecentUnreadMessage
      })

    // Get user names for better display
    for (const message of sortedMessages) {
      try {
        const userInfo = await client.users.info({ user: message.sender_name })
        if (userInfo.ok && userInfo.user) {
          const userData = userInfo.user as any
          message.sender_name = userData.display_name || 
                               userData.real_name || 
                               userData.name || 
                               'Unknown'
        }
      } catch (error) {
        // Continue with user ID if name lookup fails
      }
    }

    console.log(`✅ Found ${sortedMessages.length} recent unread messages (total unread: ${totalUnread})`)

    return {
      messages: sortedMessages,
      total_unread: totalUnread
    }

  } catch (error: any) {
    console.error("❌ Error getting recent unread messages:", error)
    return {
      messages: [],
      total_unread: 0,
      error: error.message || "Failed to get recent unread messages"
    }
  }
}

/**
 * Mark a conversation as read
 */
export async function markConversationRead(
  user: User,
  conversationId: string
): Promise<{
  success: boolean;
  conversation_name: string;
  marked_read_count: number;
  error?: string;
}> {
  try {
    console.log(`📖 Marking conversation ${conversationId} as read`)
    
    const client = new WebClient(user.accessToken)

    // Get conversation info first
    const convInfo = await client.conversations.info({
      channel: conversationId
    })

    if (!convInfo.ok || !convInfo.channel) {
      throw new Error("Conversation not found")
    }

    const channel = convInfo.channel as any
    const conversationName = getConversationDisplayName(convInfo.channel)
    const unreadCount = channel.unread_count || 0

    // Mark conversation as read
    const markResult = await client.conversations.mark({
      channel: conversationId,
      ts: channel.latest?.ts || Date.now().toString()
    })

    if (!markResult.ok) {
      throw new Error("Failed to mark conversation as read")
    }

    console.log(`✅ Marked ${conversationName} as read (${unreadCount} messages)`)

    return {
      success: true,
      conversation_name: conversationName,
      marked_read_count: unreadCount
    }

  } catch (error: any) {
    console.error(`❌ Error marking conversation ${conversationId} as read:`, error)
    return {
      success: false,
      conversation_name: 'Unknown',
      marked_read_count: 0,
      error: error.message || "Failed to mark conversation as read"
    }
  }
}

/**
 * Helper function to get display name for conversation
 */
function getConversationDisplayName(conversation: any): string {
  if (conversation.is_im) {
    return `DM: ${conversation.user || 'Unknown'}`
  } else if (conversation.name) {
    return `#${conversation.name}`
  } else {
    return conversation.id || 'Unknown'
  }
} 