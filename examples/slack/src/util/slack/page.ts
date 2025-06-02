import { WebClient } from "@slack/web-api"
import type { User } from "../index"

/**
 * Page UI specific Slack functions for enhanced conversation management
 */

export interface ConversationWithMetadata {
  id: string;
  name: string;
  display_name: string;
  type: 'dm' | 'channel' | 'group';
  unread_count: number;
  last_activity: string;
  member_count?: number;
  purpose?: string;
  is_starred: boolean;
  is_muted: boolean;
  has_mentions: boolean;
}

export interface ConversationsWithMetadata {
  conversations: ConversationWithMetadata[];
  total_count: number;
  error?: string;
}

export interface MessageWithMetadata {
  id: string;
  user: string;
  username: string;
  text: string;
  timestamp: string;
  thread_ts?: string;
  reply_count?: number;
  reactions?: Array<{emoji: string, count: number}>;
  files?: Array<{name: string, url: string, type: string}>;
  is_thread_root: boolean;
}

export interface MessagesWithPagination {
  messages: MessageWithMetadata[];
  has_more: boolean;
  next_cursor?: string;
  error?: string;
}

export interface AdvancedSearchResult {
  messages: Array<{
    id: string;
    conversation_id: string;
    conversation_name: string;
    user: string;
    text: string;
    timestamp: string;
    relevance_score?: number;
    context_before?: string;
    context_after?: string;
  }>;
  total_matches: number;
  search_time_ms: number;
  error?: string;
}

export interface ThreadInfo {
  root_message: {
    id: string;
    user: string;
    text: string;
    timestamp: string;
    reactions?: Array<{emoji: string, count: number}>;
  };
  replies: Array<{
    id: string;
    user: string;
    text: string;
    timestamp: string;
    reactions?: Array<{emoji: string, count: number}>;
  }>;
  reply_count: number;
  participants: string[];
  error?: string;
}

export interface ConversationThreads {
  threads: Array<{
    thread_ts: string;
    root_message: {
      user: string;
      text: string;
      timestamp: string;
    };
    reply_count: number;
    last_reply: string;
    participants: string[];
    has_unread: boolean;
    unread_count: number;
  }>;
  total_threads: number;
  error?: string;
}

/**
 * Get conversations with enhanced metadata for page UI
 */
export async function getConversationsWithMetadata(
  user: User,
  filters?: {
    type?: 'dm' | 'channel' | 'group' | 'all';
    unread_only?: boolean;
    active_since?: string;
  }
): Promise<ConversationsWithMetadata> {
  try {
    console.log("📋 Getting conversations with metadata for page UI")
    
    const client = new WebClient(user.accessToken)
    
    // Determine conversation types to fetch
    let types = "public_channel,private_channel,mpim,im"
    if (filters?.type && filters.type !== 'all') {
      const typeMap = {
        'dm': 'im',
        'channel': 'public_channel,private_channel',
        'group': 'mpim'
      }
      types = typeMap[filters.type] || types
    }

    // Get all conversations
    const conversationsResult = await client.conversations.list({
      types,
      exclude_archived: true,
      limit: 1000
    })

    if (!conversationsResult.ok || !conversationsResult.channels) {
      throw new Error("Failed to fetch conversations")
    }

    const conversations: ConversationWithMetadata[] = []

    // Process each conversation and enrich with metadata
    for (const conversation of conversationsResult.channels) {
      if (!conversation.id) continue

      try {
        // Get detailed conversation info
        const convInfo = await client.conversations.info({
          channel: conversation.id
        })

        if (!convInfo.ok || !convInfo.channel) continue

        const channel = convInfo.channel as any
        const unreadCount = channel.unread_count || 0

        // Apply filters
        if (filters?.unread_only && unreadCount === 0) continue
        if (filters?.active_since) {
          const activeSince = new Date(filters.active_since).getTime() / 1000
          const lastActivity = parseFloat(channel.latest?.ts || '0')
          if (lastActivity < activeSince) continue
        }

        // Get conversation metadata
        const conversationData: ConversationWithMetadata = {
          id: conversation.id,
          name: conversation.name || conversation.id,
          display_name: getConversationDisplayName(conversation),
          type: conversation.is_im ? 'dm' : 
                conversation.is_group || conversation.is_mpim ? 'group' : 'channel',
          unread_count: unreadCount,
          last_activity: channel.latest?.ts || '0',
          member_count: channel.num_members,
          purpose: channel.purpose?.value || '',
          is_starred: channel.is_starred || false,
          is_muted: channel.is_muted || false,
          has_mentions: (channel.unread_count_display || 0) > 0
        }

        conversations.push(conversationData)

      } catch (error) {
        console.warn(`Failed to get metadata for conversation ${conversation.id}:`, error)
        // Continue processing other conversations
      }
    }

    // Sort by last activity (most recent first)
    conversations.sort((a, b) => parseFloat(b.last_activity) - parseFloat(a.last_activity))

    console.log(`✅ Found ${conversations.length} conversations with metadata`)

    return {
      conversations,
      total_count: conversations.length
    }

  } catch (error: any) {
    console.error("❌ Error getting conversations with metadata:", error)
    return {
      conversations: [],
      total_count: 0,
      error: error.message || "Failed to get conversations with metadata"
    }
  }
}

/**
 * Get messages with pagination for page UI
 */
export async function getMessagesWithPagination(
  user: User,
  conversationId: string,
  options?: {
    cursor?: string;
    limit?: number;
    oldest?: string;
    latest?: string;
  }
): Promise<MessagesWithPagination> {
  try {
    console.log(`📜 Getting messages with pagination for ${conversationId}`)
    
    const client = new WebClient(user.accessToken)
    
    const historyOptions: any = {
      channel: conversationId,
      limit: options?.limit || 50,
      inclusive: true
    }

    if (options?.cursor) historyOptions.cursor = options.cursor
    if (options?.oldest) historyOptions.oldest = options.oldest
    if (options?.latest) historyOptions.latest = options.latest

    const historyResult = await client.conversations.history(historyOptions)

    if (!historyResult.ok) {
      throw new Error("Failed to fetch message history")
    }

    const messages: MessageWithMetadata[] = []

    if (historyResult.messages) {
      // Process messages and enrich with metadata
      for (const message of historyResult.messages) {
        if (message.type !== 'message' || !message.user) continue

        // Get user info for display name
        let username = message.user
        try {
          const userInfo = await client.users.info({ user: message.user })
          if (userInfo.ok && userInfo.user) {
            const userData = userInfo.user as any
            username = userData.display_name || userData.real_name || userData.name || message.user
          }
        } catch (error) {
          // Continue with user ID if lookup fails
        }

        // Process reactions
        const reactions = (message.reactions || []).map(reaction => ({
          emoji: reaction.name || '',
          count: reaction.count || 0
        }))

        // Process files
        const files = (message.files || []).map(file => ({
          name: file.name || 'Unknown',
          url: file.url_private || file.permalink || '',
          type: file.filetype || 'unknown'
        }))

        const messageData: MessageWithMetadata = {
          id: message.ts || '',
          user: message.user,
          username,
          text: message.text || '',
          timestamp: message.ts || '',
          thread_ts: message.thread_ts,
          reply_count: (message as any).reply_count || 0,
          reactions: reactions.length > 0 ? reactions : undefined,
          files: files.length > 0 ? files : undefined,
          is_thread_root: !!(message.thread_ts && message.ts === message.thread_ts)
        }

        messages.push(messageData)
      }
    }

    console.log(`✅ Retrieved ${messages.length} messages with pagination`)

    return {
      messages,
      has_more: historyResult.has_more || false,
      next_cursor: historyResult.response_metadata?.next_cursor
    }

  } catch (error: any) {
    console.error(`❌ Error getting messages with pagination for ${conversationId}:`, error)
    return {
      messages: [],
      has_more: false,
      error: error.message || "Failed to get messages with pagination"
    }
  }
}

/**
 * Advanced message search with multiple parameters
 */
export async function searchMessagesAdvanced(
  user: User,
  query: string,
  filters?: {
    from_user?: string;
    in_channel?: string;
    date_from?: string;
    date_to?: string;
    has_files?: boolean;
    has_links?: boolean;
    message_type?: 'text' | 'file' | 'all';
    sort_by?: 'timestamp' | 'relevance';
    limit?: number;
  }
): Promise<AdvancedSearchResult> {
  try {
    const startTime = Date.now()
    console.log(`🔍 Advanced search for: "${query}" with filters`)
    
    const client = new WebClient(user.accessToken)
    
    // Build search query with filters
    let searchQuery = query
    
    if (filters?.from_user) {
      searchQuery += ` from:${filters.from_user}`
    }
    
    if (filters?.in_channel) {
      searchQuery += ` in:${filters.in_channel}`
    }
    
    if (filters?.date_from) {
      searchQuery += ` after:${filters.date_from}`
    }
    
    if (filters?.date_to) {
      searchQuery += ` before:${filters.date_to}`
    }
    
    if (filters?.has_files) {
      searchQuery += ` has:file`
    }
    
    if (filters?.has_links) {
      searchQuery += ` has:link`
    }

    // Execute search
    const searchResult = await client.search.messages({
      query: searchQuery,
      count: filters?.limit || 20,
      sort: filters?.sort_by === 'relevance' ? 'score' : 'timestamp'
    })

    if (!searchResult.ok) {
      throw new Error("Search failed")
    }

    const messages: AdvancedSearchResult['messages'] = []

    if (searchResult.messages?.matches) {
      // Process search results
      for (const match of searchResult.messages.matches) {
        if (!match.type || match.type !== 'message') continue

        // Get conversation name
        let conversationName = match.channel?.name || match.channel?.id || 'Unknown'
        if (match.channel?.is_im) {
          conversationName = `DM: ${match.username || 'Unknown'}`
        } else if (match.channel?.name) {
          conversationName = `#${match.channel.name}`
        }

        const resultMessage = {
          id: match.ts || '',
          conversation_id: match.channel?.id || '',
          conversation_name: conversationName,
          user: match.user || '',
          text: match.text || '',
          timestamp: match.ts || '',
          relevance_score: match.score,
          context_before: (match as any).previous?.text || '',
          context_after: (match as any).next?.text || ''
        }

        messages.push(resultMessage)
      }
    }

    const searchTime = Date.now() - startTime
    const totalMatches = searchResult.messages?.total || 0

    console.log(`✅ Found ${messages.length} messages in ${searchTime}ms (total: ${totalMatches})`)

    return {
      messages,
      total_matches: totalMatches,
      search_time_ms: searchTime
    }

  } catch (error: any) {
    console.error(`❌ Error in advanced search:`, error)
    return {
      messages: [],
      total_matches: 0,
      search_time_ms: 0,
      error: error.message || "Advanced search failed"
    }
  }
}

/**
 * Get full thread messages
 */
export async function getThreadMessages(
  user: User,
  conversationId: string,
  threadTs: string
): Promise<ThreadInfo> {
  try {
    console.log(`🧵 Getting thread messages for ${threadTs} in ${conversationId}`)
    
    const client = new WebClient(user.accessToken)

    // Get thread replies
    const repliesResult = await client.conversations.replies({
      channel: conversationId,
      ts: threadTs,
      inclusive: true
    })

    if (!repliesResult.ok || !repliesResult.messages) {
      throw new Error("Failed to fetch thread messages")
    }

    const messages = repliesResult.messages
    if (messages.length === 0) {
      throw new Error("Thread not found")
    }

    // First message is the root
    const rootMessage = messages[0]
    const replies = messages.slice(1)

    // Get user info for all participants
    const participants = [...new Set(messages.map(m => m.user).filter(Boolean))] as string[]
    const userNames: Record<string, string> = {}

    for (const userId of participants) {
      if (!userId) continue
      try {
        const userInfo = await client.users.info({ user: userId })
        if (userInfo.ok && userInfo.user) {
          const userData = userInfo.user as any
          userNames[userId] = userData.display_name || userData.real_name || userData.name || userId
        }
      } catch (error) {
        userNames[userId] = userId
      }
    }

    // Process root message
    const rootMessageData = {
      id: rootMessage.ts || '',
      user: userNames[rootMessage.user || ''] || rootMessage.user || '',
      text: rootMessage.text || '',
      timestamp: rootMessage.ts || '',
      reactions: (rootMessage.reactions || []).map(r => ({
        emoji: r.name || '',
        count: r.count || 0
      }))
    }

    // Process replies
    const repliesData = replies.map(reply => ({
      id: reply.ts || '',
      user: userNames[reply.user || ''] || reply.user || '',
      text: reply.text || '',
      timestamp: reply.ts || '',
      reactions: (reply.reactions || []).map(r => ({
        emoji: r.name || '',
        count: r.count || 0
      }))
    }))

    console.log(`✅ Retrieved thread with ${replies.length} replies`)

    return {
      root_message: rootMessageData,
      replies: repliesData,
      reply_count: replies.length,
      participants: participants.map(id => userNames[id] || id)
    }

  } catch (error: any) {
    console.error(`❌ Error getting thread messages:`, error)
    return {
      root_message: {
        id: '',
        user: '',
        text: '',
        timestamp: ''
      },
      replies: [],
      reply_count: 0,
      participants: [],
      error: error.message || "Failed to get thread messages"
    }
  }
}

/**
 * Get all threads in a conversation
 */
export async function getConversationThreads(
  user: User,
  conversationId: string,
  options?: {
    include_read?: boolean;
    min_replies?: number;
    since?: string;
  }
): Promise<ConversationThreads> {
  try {
    console.log(`🧵 Getting conversation threads for ${conversationId}`)
    
    const client = new WebClient(user.accessToken)

    // Get conversation history to find thread roots
    const historyResult = await client.conversations.history({
      channel: conversationId,
      limit: 1000,
      oldest: options?.since,
      inclusive: true
    })

    if (!historyResult.ok || !historyResult.messages) {
      throw new Error("Failed to fetch conversation history")
    }

    const threads: ConversationThreads['threads'] = []

    // Find messages that have thread replies
    for (const message of historyResult.messages) {
      if (!message.ts || !message.thread_ts || message.ts !== message.thread_ts) continue

      const replyCount = (message as any).reply_count || 0
      if (options?.min_replies && replyCount < options.min_replies) continue

      // Get thread info
      try {
        const repliesResult = await client.conversations.replies({
          channel: conversationId,
          ts: message.ts,
          inclusive: false // Only get replies, not the root
        })

        if (!repliesResult.ok) continue

        const replies = repliesResult.messages || []
        const participants = [...new Set([message.user, ...replies.map(r => r.user)].filter(Boolean))] as string[]

        // Determine if thread has unread messages (simplified approach)
        const hasUnread = false // This would require more complex logic with read state
        const unreadCount = 0

        if (!options?.include_read && !hasUnread && replyCount > 0) {
          // Skip read threads if not including them
          continue
        }

        const threadData = {
          thread_ts: message.ts,
          root_message: {
            user: message.user || '',
            text: message.text || '',
            timestamp: message.ts || ''
          },
          reply_count: replyCount,
          last_reply: replies.length > 0 ? replies[replies.length - 1].ts || '' : message.ts,
          participants: participants,
          has_unread: hasUnread,
          unread_count: unreadCount
        }

        threads.push(threadData)

      } catch (error) {
        console.warn(`Failed to get thread info for ${message.ts}:`, error)
      }
    }

    // Sort by last activity (most recent first)
    threads.sort((a, b) => parseFloat(b.last_reply) - parseFloat(a.last_reply))

    console.log(`✅ Found ${threads.length} threads in conversation`)

    return {
      threads,
      total_threads: threads.length
    }

  } catch (error: any) {
    console.error(`❌ Error getting conversation threads:`, error)
    return {
      threads: [],
      total_threads: 0,
      error: error.message || "Failed to get conversation threads"
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