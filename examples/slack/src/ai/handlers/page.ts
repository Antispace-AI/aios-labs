import type { User } from "../../util"
import { 
  getConversationsWithMetadata, 
  getMessagesWithPagination, 
  searchMessagesAdvanced,
  getThreadMessages,
  getConversationThreads
} from "../../util/slack/page"

/**
 * Page UI specific action handlers for Phase 1 functions
 */

export async function handlePageActions(
  name: string,
  parsedParams: any,
  user: User
): Promise<any> {
  console.log("📋 Handling Page action:", name)

  switch (name) {
    case "get_conversations_with_metadata": {
      const { type, unread_only, active_since } = parsedParams
      console.log("📋 Getting conversations with metadata for page UI")
      
      try {
        const filters = {
          type: type as 'dm' | 'channel' | 'group' | 'all' | undefined,
          unread_only: unread_only === true || unread_only === 'true',
          active_since
        }

        const result = await getConversationsWithMetadata(user, filters)
        
        if (result.error) {
          return {
            error: result.error,
            conversations: result.conversations,
            total_count: result.total_count
          }
        }

        return {
          success: true,
          conversations: result.conversations,
          total_count: result.total_count,
          message: `Found ${result.total_count} conversations with metadata`
        }
      } catch (error: any) {
        console.error("❌ Error in get_conversations_with_metadata:", error)
        return {
          error: "Failed to get conversations with metadata",
          details: error.message
        }
      }
    }

    case "get_messages_with_pagination": {
      const { conversation_id, cursor, limit, oldest, latest } = parsedParams
      if (!conversation_id) {
        return {
          error: "conversation_id parameter is required",
          message: "Please provide the conversation ID to get messages from"
        }
      }

      console.log(`📜 Getting messages with pagination for ${conversation_id}`)
      
      try {
        const options = {
          cursor,
          limit: limit ? parseInt(limit) : undefined,
          oldest,
          latest
        }

        const result = await getMessagesWithPagination(user, conversation_id, options)
        
        if (result.error) {
          return {
            error: result.error,
            messages: result.messages,
            has_more: result.has_more
          }
        }

        return {
          success: true,
          messages: result.messages,
          has_more: result.has_more,
          next_cursor: result.next_cursor,
          message: `Retrieved ${result.messages.length} messages${result.has_more ? ' (more available)' : ''}`
        }
      } catch (error: any) {
        console.error("❌ Error in get_messages_with_pagination:", error)
        return {
          error: "Failed to get messages with pagination",
          details: error.message
        }
      }
    }

    case "search_messages_advanced": {
      const { 
        query, 
        from_user, 
        in_channel, 
        date_from, 
        date_to, 
        has_files, 
        has_links, 
        message_type, 
        sort_by, 
        limit 
      } = parsedParams

      if (!query) {
        return {
          error: "query parameter is required",
          message: "Please provide a search query"
        }
      }

      console.log(`🔍 Advanced search for: "${query}"`)
      
      try {
        const filters = {
          from_user,
          in_channel,
          date_from,
          date_to,
          has_files: has_files === true || has_files === 'true',
          has_links: has_links === true || has_links === 'true',
          message_type: message_type as 'text' | 'file' | 'all' | undefined,
          sort_by: sort_by as 'timestamp' | 'relevance' | undefined,
          limit: limit ? parseInt(limit) : undefined
        }

        const result = await searchMessagesAdvanced(user, query, filters)
        
        if (result.error) {
          return {
            error: result.error,
            messages: result.messages,
            total_matches: result.total_matches
          }
        }

        return {
          success: true,
          messages: result.messages,
          total_matches: result.total_matches,
          search_time_ms: result.search_time_ms,
          message: `Found ${result.messages.length} messages in ${result.search_time_ms}ms (total: ${result.total_matches})`
        }
      } catch (error: any) {
        console.error("❌ Error in search_messages_advanced:", error)
        return {
          error: "Failed to perform advanced search",
          details: error.message
        }
      }
    }

    case "get_thread_messages": {
      const { conversation_id, thread_ts } = parsedParams
      if (!conversation_id || !thread_ts) {
        return {
          error: "conversation_id and thread_ts parameters are required",
          message: "Please provide the conversation ID and thread timestamp"
        }
      }

      console.log(`🧵 Getting thread messages for ${thread_ts} in ${conversation_id}`)
      
      try {
        const result = await getThreadMessages(user, conversation_id, thread_ts)
        
        if (result.error) {
          return {
            error: result.error,
            root_message: result.root_message,
            replies: result.replies
          }
        }

        return {
          success: true,
          root_message: result.root_message,
          replies: result.replies,
          reply_count: result.reply_count,
          participants: result.participants,
          message: `Retrieved thread with ${result.reply_count} replies and ${result.participants.length} participants`
        }
      } catch (error: any) {
        console.error("❌ Error in get_thread_messages:", error)
        return {
          error: "Failed to get thread messages",
          details: error.message
        }
      }
    }

    case "get_conversation_threads": {
      const { conversation_id, include_read, min_replies, since } = parsedParams
      if (!conversation_id) {
        return {
          error: "conversation_id parameter is required",
          message: "Please provide the conversation ID to get threads from"
        }
      }

      console.log(`🧵 Getting conversation threads for ${conversation_id}`)
      
      try {
        const options = {
          include_read: include_read === true || include_read === 'true',
          min_replies: min_replies ? parseInt(min_replies) : undefined,
          since
        }

        const result = await getConversationThreads(user, conversation_id, options)
        
        if (result.error) {
          return {
            error: result.error,
            threads: result.threads,
            total_threads: result.total_threads
          }
        }

        return {
          success: true,
          threads: result.threads,
          total_threads: result.total_threads,
          message: `Found ${result.total_threads} threads in conversation`
        }
      } catch (error: any) {
        console.error("❌ Error in get_conversation_threads:", error)
        return {
          error: "Failed to get conversation threads",
          details: error.message
        }
      }
    }

    default: {
      console.log("❌ Unknown Page function name:", name)
      return { error: `Unknown Page function: ${name}` }
    }
  }
} 