import type { User } from "../../util"
import { getTotalUnreadCount, getRecentUnreadMessages, markConversationRead } from "../../util/slack/widget"

/**
 * Widget-specific action handlers for Phase 1 functions
 */

export async function handleWidgetActions(
  name: string,
  parsedParams: any,
  user: User
): Promise<any> {
  console.log("🎯 Handling Widget action:", name)

  switch (name) {
    case "get_total_unread_count": {
      console.log("🔢 Getting total unread count for widget")
      
      try {
        const result = await getTotalUnreadCount(user)
        
        if (result.error) {
          return {
            error: result.error,
            total: result.total,
            breakdown: result.breakdown
          }
        }

        return {
          success: true,
          total_unread: result.total,
          breakdown: result.breakdown,
          message: `You have ${result.total} unread messages (${result.breakdown.dms} DMs, ${result.breakdown.channels} channels, ${result.breakdown.mentions} mentions)`
        }
      } catch (error: any) {
        console.error("❌ Error in get_total_unread_count:", error)
        return {
          error: "Failed to get unread count",
          details: error.message
        }
      }
    }

    case "get_recent_unread_messages": {
      const { limit = 3 } = parsedParams
      console.log(`📨 Getting ${limit} recent unread messages for widget`)
      
      try {
        const result = await getRecentUnreadMessages(user, limit)
        
        if (result.error) {
          return {
            error: result.error,
            messages: result.messages,
            total_unread: result.total_unread
          }
        }

        return {
          success: true,
          messages: result.messages,
          total_unread: result.total_unread,
          message: `Found ${result.messages.length} recent unread messages out of ${result.total_unread} total`
        }
      } catch (error: any) {
        console.error("❌ Error in get_recent_unread_messages:", error)
        return {
          error: "Failed to get recent unread messages",
          details: error.message
        }
      }
    }

    case "mark_conversation_read": {
      const { conversation_id } = parsedParams
      if (!conversation_id) {
        return {
          error: "conversation_id parameter is required",
          message: "Please provide the conversation ID to mark as read"
        }
      }

      console.log(`📖 Marking conversation ${conversation_id} as read`)
      
      try {
        const result = await markConversationRead(user, conversation_id)
        
        if (!result.success) {
          return {
            error: result.error || "Failed to mark conversation as read",
            conversation_name: result.conversation_name
          }
        }

        return {
          success: true,
          conversation_name: result.conversation_name,
          marked_read_count: result.marked_read_count,
          message: `Successfully marked ${result.conversation_name} as read (${result.marked_read_count} messages)`
        }
      } catch (error: any) {
        console.error("❌ Error in mark_conversation_read:", error)
        return {
          error: "Failed to mark conversation as read",
          details: error.message
        }
      }
    }

    default: {
      console.log("❌ Unknown Widget function name:", name)
      return { error: `Unknown Widget function: ${name}` }
    }
  }
} 