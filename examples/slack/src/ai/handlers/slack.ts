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
    case "sendMessage": {
      const { channel, text, threadTs } = parsedParams as any
      return await sendMessage(user, channel, text, undefined, threadTs)
    }

    // CONV-001: listConversations
    case "listConversations": {
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
    case "getMessages": {
      const { channel, limit = 20 } = parsedParams as any
      return await getMessages(user, channel, limit)
    }

    // SRCH-001: searchMessages
    case "searchMessages": {
      const { query, count = 20 } = parsedParams as any
      return await searchMessages(user, query, count)
    }

    // USER-001: getUserProfile
    case "getUserProfile": {
      const { user: userId } = parsedParams as any
      return await getUserProfile(user, userId)
    }

    // CONV-002: getConversationDetails
    case "getConversationDetails": {
      const { channel } = parsedParams as any
      return await getConversationDetails(user, channel)
    }

    // RT-001: getTotalUnreadSummary
    case "getTotalUnreadSummary": {
      return await getTotalUnreadSummary(user)
    }

    // RT-002: getRecentUnreadMessages
    case "getRecentUnreadMessages": {
      const { limit = 10 } = parsedParams as any
      return await getRecentUnreadMessages(user, limit)
    }

    // RT-003: markConversationAsRead
    case "markConversationAsRead": {
      const { conversationId, latestTs } = parsedParams as any
      return await markConversationAsRead(user, conversationId, latestTs)
    }

    default: {
      return { 
        error: `Unknown function: ${name}` 
      }
    }
  }
} 