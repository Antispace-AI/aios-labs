/**
 * Slack Integration Module - Phase 1 & 2A Implementation
 * 
 * This module provides organized access to Slack functionality for Antispace.
 * Implementation follows the structured plan with domain-based organization.
 * 
 * Phase 1 includes:
 * - Authentication (AUTH-001, AUTH-002, AUTH-003)
 * - Basic Conversations (CONV-001, CONV-002)
 * - Basic Messaging (MSG-001, MSG-002)
 * - Real-time Unread Tracking (RT-001, RT-002, RT-003)
 * - Basic User Management (USER-001)
 * - Basic Search (SRCH-001)
 * 
 * Phase 2A includes:
 * - Authentication Completion (AUTH-004)
 * - Advanced Conversation Management (CONV-003, CONV-004, CONV-009, CONV-010)
 * - Essential Messaging Operations (MSG-003, MSG-004, MSG-006)
 * - Basic File Management (FILE-001, FILE-002)
 */

// Export all types
export * from './types'

// Export shared utilities
export { SlackClientPool, SlackAPIError, clientPool, handleSlackResponse } from './client'

// Authentication module exports
export {
  getOAuthURL,
  handleOAuthCallback,
  checkAuthenticationStatus,
  revokeAuthentication,
  validateUserAuth
} from './auth'

// Conversations module exports
export {
  listConversations,
  getConversationDetails,
  getConversationMembers,
  createConversation,
  joinConversation,
  leaveConversation
} from './conversations'

// Messaging module exports
export {
  getMessages,
  sendMessage,
  updateMessage,
  deleteMessage,
  getMessagePermalink
} from './messaging'

// Real-time state management exports
export {
  getTotalUnreadSummary,
  markConversationAsRead,
  getRecentUnreadMessages,
  markSpecificMessagesAsRead
} from './realtime'

// User management exports
export {
  getUserProfile,
  setUserStatus,
  getUserPresence,
  listUsers
} from './users'

// Search module exports
export {
  searchMessages,
  searchMessagesAdvanced
} from './search'

// Files module exports
export {
  listFiles,
  uploadFile
} from './files'

/**
 * Developer mode utilities for bypassing rate limiting
 * ⚠️ FOR DEVELOPMENT ONLY - Use with caution in production
 */

/**
 * Execute a Slack function directly with rate limiting bypassed
 * This bypasses all rate limiting mechanisms for developer mode
 */
export async function executeWithBypassedRateLimit<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  console.log(`🚨 DEVELOPER MODE: Executing ${operationName} with ALL rate limiting bypassed`)
  
  try {
    // Execute the operation directly without any rate limiting
    const result = await operation()
    
    console.log(`✅ DEVELOPER MODE: Successfully executed ${operationName}`)
    return result
  } catch (error: any) {
    console.error(`❌ DEVELOPER MODE: Failed to execute ${operationName}:`, error.message)
    throw error
  }
}

/**
 * Parse natural language commands and map them to function calls
 */
export function parseNaturalLanguageCommand(command: string): { functionName: string; params: any } | null {
  const lowerCommand = command.toLowerCase().trim()
  
  // Send message patterns
  if (lowerCommand.includes('send') && (lowerCommand.includes('message') || lowerCommand.includes('say'))) {
    const channelMatch = lowerCommand.match(/(?:to|in)\s+([#@]\w+|\w+)/i)
    const textMatch = lowerCommand.match(/(?:saying?|message)\s+["']?([^"']+)["']?/i)
    
    if (channelMatch && textMatch) {
      return {
        functionName: 'sendMessage',
        params: {
          channel: channelMatch[1],
          text: textMatch[1]
        }
      }
    }
  }
  
  // Get messages patterns
  if (lowerCommand.includes('get') || lowerCommand.includes('show') || lowerCommand.includes('recent')) {
    if (lowerCommand.includes('message')) {
      const channelMatch = lowerCommand.match(/(?:from|in)\s+([#@]\w+|\w+)/i)
      if (channelMatch) {
        return {
          functionName: 'getMessages',
          params: {
            channel: channelMatch[1],
            limit: 10
          }
        }
      }
    }
  }
  
  // List conversations
  if (lowerCommand.includes('conversation') || lowerCommand.includes('channel')) {
    if (lowerCommand.includes('list') || lowerCommand.includes('get') || lowerCommand.includes('show')) {
      return {
        functionName: 'listConversations',
        params: {}
      }
    }
  }
  
  // Search messages
  if (lowerCommand.includes('search')) {
    const queryMatch = lowerCommand.match(/search\s+(?:for\s+)?["']?([^"']+)["']?/i)
    if (queryMatch) {
      return {
        functionName: 'searchMessages',
        params: {
          query: queryMatch[1],
          count: 20
        }
      }
    }
  }
  
  return null
}

/**
 * ✅ PHASE 1 & 2A IMPLEMENTATION STATUS:
 * 
 * ✅ Phase 1 Core Functions:
 * - AUTH-001: getOAuthURL
 * - AUTH-002: handleOAuthCallback  
 * - AUTH-003: checkAuthenticationStatus
 * - CONV-001: listConversations
 * - CONV-002: getConversationDetails
 * - MSG-001: getMessages
 * - MSG-002: sendMessage
 * - RT-001: getTotalUnreadSummary
 * - RT-002: getRecentUnreadMessages
 * - RT-003: markConversationAsRead
 * - USER-001: getUserProfile
 * - SRCH-001: searchMessages
 * 
 * ✅ Phase 2A Core Extensions:
 * - AUTH-004: revokeAuthentication
 * - CONV-003: getConversationMembers
 * - CONV-004: createConversation
 * - CONV-009: joinConversation
 * - CONV-010: leaveConversation
 * - MSG-003: updateMessage
 * - MSG-004: deleteMessage
 * - MSG-006: getMessagePermalink
 * - FILE-001: listFiles
 * - FILE-002: uploadFile
 * 
 * ✅ Shared Infrastructure:
 * - Single SlackClientPool for all modules
 * - Consistent error handling via SlackAPIError
 * - Shared handleSlackResponse wrapper
 * - Clean modular structure
 * 
 * 🚧 Phase 2B+ Ready:
 * - Message interactions (reactions, pins)
 * - Enhanced user management
 * - Advanced search with filters
 * - Productivity features (reminders, drafts)
 * - Real-time advanced state management
 */ 