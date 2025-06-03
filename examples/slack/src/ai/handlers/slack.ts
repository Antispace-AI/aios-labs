import { sendMessage, getMessages } from "../../util/slack/messaging"
import { listConversations, getConversationDetails } from "../../util/slack/conversations"  
import { searchMessages } from "../../util/slack/search"
import { getUserProfile } from "../../util/slack/users"
import { getTotalUnreadSummary, markConversationAsRead, getRecentUnreadMessages } from "../../util/slack/realtime"
import type { User } from "../../util"

/**
 * Slack action handlers
 * Uses implementation plan function names (docs/slack_functions_implementation_plan.md)
 */

export async function handleSlackActions(
  name: string,
  parsedParams: any,
  user: User
): Promise<any> {
  
  switch (name) {
    // MSG-002: sendMessage
    case "send_message": {
      const { channel, text, thread_ts } = parsedParams as any
      return await sendMessage(user, channel, text, undefined, thread_ts)
    }

    // CONV-001: listConversations
    case "list_conversations": {
      try {
        return await listConversations(user)
      } catch (error: any) {
        return {
          error: "Failed to get conversations",
          message: error.message,
          details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }
      }
    }

    // MSG-001: getMessages
    case "get_messages": {
      const { channel, limit = 20 } = parsedParams as any
      return await getMessages(user, channel, limit)
    }

    // SRCH-001: searchMessages
    case "search_messages": {
      const { query, count = 20 } = parsedParams as any
      return await searchMessages(user, query, count)
    }

    // USER-001: getUserProfile
    case "get_user_profile": {
      const { user: userId } = parsedParams as any
      return await getUserProfile(user, userId)
    }

    // CONV-002: getConversationDetails
    case "get_conversation_details": {
      const { channel } = parsedParams as any
      return await getConversationDetails(user, channel)
    }

    // RT-001: getTotalUnreadSummary
    case "get_total_unread_summary": {
      return await getTotalUnreadSummary(user)
    }

    // RT-002: getRecentUnreadMessages
    case "get_recent_unread_messages": {
      const { limit = 10 } = parsedParams as any
      return await getRecentUnreadMessages(user, limit)
    }

    // RT-003: markConversationAsRead
    case "mark_conversation_as_read": {
      const { conversation_id, latest_ts } = parsedParams as any
      return await markConversationAsRead(user, conversation_id, latest_ts)
    }

    default: {
      return { 
        error: `Unknown function: ${name}` 
      }
    }
  }
} 