import { sendMessage, getConversations, getMessages, searchMessages, getUserInfo, getConversationInfo } from "../../util/slack"
import type { User } from "../../util"

/**
 * Slack action handlers
 */

export async function handleSlackActions(
  name: string,
  parsedParams: any,
  user: User
): Promise<any> {
  console.log("🔍 Handling Slack action:", name)

  switch (name) {
    case "send_message": {
      console.log("🎯 send_message case - parsedParams:", parsedParams)
      const { channel, text, thread_ts } = parsedParams as any
      console.log("🎯 Extracted values:")
      console.log("  - channel:", channel)
      console.log("  - text:", text)
      console.log("  - thread_ts:", thread_ts)
      console.log(`Sending message to ${channel}: ${text}`)
      
      return await sendMessage(user, channel, text, thread_ts)
    }

    case "get_conversations": {
      console.log("🎯 Starting get_conversations function")
      console.log("📋 User has token:", !!user.accessToken)
      console.log("🔑 Token preview:", user.accessToken?.substring(0, 12) + "...")
      
      try {
        console.log("📡 About to call getConversations from slack utility...")
        const result = await getConversations(user)
        console.log("✅ Got result from getConversations:", result)
        return result
      } catch (error: any) {
        console.error("❌ Error in get_conversations:", error)
        return {
          error: "Failed to get conversations",
          message: error.message,
          details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }
      }
    }

    case "get_messages": {
      const { channel, limit = 20 } = parsedParams as any
      console.log(`Getting messages from ${channel} (limit: ${limit})`)
      
      return await getMessages(user, channel, limit)
    }

    case "search_messages": {
      const { query, count = 20 } = parsedParams as any
      console.log(`Searching messages for: ${query}`)
      
      return await searchMessages(user, query, count)
    }

    case "get_user_info": {
      const { user: userId } = parsedParams as any
      console.log(`Getting user info for: ${userId}`)
      
      return await getUserInfo(user, userId)
    }

    case "get_conversation_info": {
      const { channel } = parsedParams as any
      console.log(`Getting conversation info for: ${channel}`)
      
      return await getConversationInfo(user, channel)
    }

    default: {
      console.log("❌ Unknown Slack function name:", name)
      return { error: `Unknown Slack function: ${name}` }
    }
  }
} 