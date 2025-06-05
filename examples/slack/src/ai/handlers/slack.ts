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
      // conversationId can now be a channel name or ID
      return await joinConversation(user, conversationId)
    }

    // CONV-010: leaveConversation
    case "leaveConversation": {
      const { conversationId } = parsedParams as any
      // conversationId can now be a channel name or ID
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

/**
 * Execute Slack functions with rate limiting bypassed for developer mode
 * This is called from the widget UI for direct function execution
 */
export async function executeSlackFunctionBypass(
  functionName: string,
  parameters: any,
  user: User
): Promise<any> {
  
  try {
    console.log(`🚨 DEVELOPER MODE: Starting bypass execution of ${functionName}`)
    
    // Import the bypass utility
    const { executeWithBypassedRateLimit } = await import("../../util/slack/index.js")
    
    const result = await executeWithBypassedRateLimit(async () => {
      // Execute the function normally, but rate limiting is bypassed
      return await handleSlackActions(functionName, parameters, user)
    }, `BYPASS_${functionName}`)
    
    console.log(`🚨 DEVELOPER MODE: Bypass execution completed for ${functionName}`, result)
    
    // Ensure we always return a valid object
    return result || { success: true, message: "Function executed but returned no data" }
  } catch (error: any) {
    console.error(`🚨 DEVELOPER MODE: Bypass execution failed for ${functionName}:`, error)
    return {
      error: error.message || "Unknown error occurred",
      functionName,
      parameters
    }
  }
}

/**
 * Execute natural language commands with rate limiting bypassed
 */
export async function executeNaturalLanguageBypass(
  command: string,
  user: User
): Promise<any> {
  
  try {
    console.log(`🚨 DEVELOPER MODE: Starting natural language bypass for: "${command}"`)
    
    // Import the utilities
    const { executeWithBypassedRateLimit, parseNaturalLanguageCommand } = await import("../../util/slack/index.js")
    
    const parsed = await parseNaturalLanguageCommand(command)
    
    if (!parsed) {
      console.log(`🚨 DEVELOPER MODE: Could not parse command: "${command}"`)
      return {
        error: "Could not parse natural language command",
        suggestion: "Try commands like 'send a message to #general saying hello' or 'get recent messages from #random'",
        command
      }
    }
    
    console.log(`🚨 DEVELOPER MODE: Parsed command as:`, parsed)
    
    const result = await executeWithBypassedRateLimit(async () => {
      return await handleSlackActions(parsed.functionName, parsed.params, user)
    }, `BYPASS_NL_${parsed.functionName}`)
    
    console.log(`🚨 DEVELOPER MODE: Natural language bypass completed`, result)
    
    // Ensure we always return a valid object
    return result || { success: true, message: "Command executed but returned no data" }
  } catch (error: any) {
    console.error(`🚨 DEVELOPER MODE: Natural language bypass failed:`, error)
    return {
      error: error.message || "Unknown error occurred",
      command
    }
  }
} 