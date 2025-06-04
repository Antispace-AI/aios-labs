import { sendMessage, getMessages, updateMessage, deleteMessage, getMessagePermalink } from "../../util/slack/messaging"
import { listConversations, getConversationDetails, getConversationMembers, createConversation, joinConversation, leaveConversation } from "../../util/slack/conversations"  
import { searchMessages } from "../../util/slack/search"
import { getUserProfile } from "../../util/slack/users"
import { getTotalUnreadSummary, markConversationAsRead, getRecentUnreadMessages } from "../../util/slack/realtime"
import { revokeAuthentication } from "../../util/slack/auth"
import { listFiles, uploadFile } from "../../util/slack/files"
import type { User } from "../../util"

/**
 * Slack action handlers
 * Uses implementation plan function names (docs/slack_functions_implementation_plan.md)
 * Updated with Phase 2A functions
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

    // ===== PHASE 2A FUNCTIONS =====

    // AUTH-004: revokeAuthentication
    case "revokeAuthentication": {
      return await revokeAuthentication(user.id)
    }

    // CONV-003: getConversationMembers
    case "getConversationMembers": {
      const { conversationId, limit } = parsedParams as any
      return await getConversationMembers(user, conversationId, limit)
    }

    // CONV-004: createConversation
    case "createConversation": {
      const { name, isPrivate, memberUserIds } = parsedParams as any
      return await createConversation(user, name, isPrivate, memberUserIds)
    }

    // CONV-009: joinConversation
    case "joinConversation": {
      const { conversationId } = parsedParams as any
      return await joinConversation(user, conversationId)
    }

    // CONV-010: leaveConversation
    case "leaveConversation": {
      const { conversationId } = parsedParams as any
      return await leaveConversation(user, conversationId)
    }

    // MSG-003: updateMessage
    case "updateMessage": {
      const { conversationId, messageTs, text, blocks } = parsedParams as any
      return await updateMessage(user, conversationId, messageTs, text, blocks)
    }

    // MSG-004: deleteMessage
    case "deleteMessage": {
      const { conversationId, messageTs } = parsedParams as any
      return await deleteMessage(user, conversationId, messageTs)
    }

    // MSG-006: getMessagePermalink
    case "getMessagePermalink": {
      const { conversationId, messageTs } = parsedParams as any
      return await getMessagePermalink(user, conversationId, messageTs)
    }

    // FILE-001: listFiles
    case "listFiles": {
      const { conversationId, types, limit, page } = parsedParams as any
      return await listFiles(user, conversationId, types, limit, page)
    }

    // FILE-002: uploadFile
    case "uploadFile": {
      const { conversationId, filename, title, initialComment, filetype } = parsedParams as any
      // Note: This is a placeholder - actual file upload would need file content handling
      return {
        success: false,
        error: "File upload requires file content handling implementation"
      }
    }

    default: {
      return { 
        error: `Unknown function: ${name}` 
      }
    }
  }
} 