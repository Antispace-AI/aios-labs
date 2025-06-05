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
 * Parse natural language commands using Gemini AI and map them to function calls
 * This replaces hardcoded pattern matching with AI-powered understanding
 */
export async function parseNaturalLanguageCommand(command: string): Promise<{ functionName: string; params: any } | null> {
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    
    // Initialize Gemini AI
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('🔧 GEMINI_API_KEY not found, falling back to basic pattern matching');
      return parseNaturalLanguageCommandFallback(command);
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Create the functions manifest context
    const functionsManifest = {
      sendMessage: {
        description: "Send a message to a Slack channel, DM, or group. Can optionally reply in a thread.",
        parameters: {
          channel: "Channel ID (e.g. C1234567890), user ID for DM (e.g. U1234567890), or channel name (e.g. #general)",
          text: "Message text to send. Supports Slack markdown formatting.",
          threadTs: "Optional timestamp of parent message to reply in thread"
        },
        required: ["channel", "text"]
      },
      getMessages: {
        description: "Fetch recent messages from a specific Slack channel or DM",
        parameters: {
          channel: "Channel ID (e.g. C1234567890) or user ID for DM (e.g. U1234567890)",
          limit: "Number of messages to fetch (default: 10, max: 1000)",
          oldest: "Only messages after this timestamp (inclusive)",
          latest: "Only messages before this timestamp (exclusive)"
        },
        required: ["channel"]
      },
      listConversations: {
        description: "List Slack conversations (channels, DMs, groups) that the user has access to",
        parameters: {
          types: "Comma-separated list of conversation types to include: public_channel, private_channel, im, mpim. Default: all types",
          limit: "Maximum number of conversations to return (default: 100, max: 1000)"
        },
        required: []
      },
      searchMessages: {
        description: "Search for messages across all accessible Slack channels and DMs",
        parameters: {
          query: "Search query. Supports Slack search syntax (e.g. 'from:@user', 'in:#channel', 'has:link')",
          sort: "Sort order: 'timestamp' (default) or 'score'",
          count: "Number of messages to return (default: 20, max: 100)"
        },
        required: ["query"]
      },
      getUserProfile: {
        description: "Get detailed profile information about a Slack user by their user ID",
        parameters: {
          user: "User ID (e.g. U1234567890)"
        },
        required: ["user"]
      },
      getConversationDetails: {
        description: "Get detailed information about a specific channel or conversation",
        parameters: {
          channel: "Channel ID (e.g. C1234567890) or user ID for DM (e.g. U1234567890)"
        },
        required: ["channel"]
      },
      getTotalUnreadSummary: {
        description: "Get the total count of unread messages across all conversations, broken down by type (DMs, channels, mentions) for widget display",
        parameters: {},
        required: []
      },
      getRecentUnreadMessages: {
        description: "Get the most recent unread messages for widget preview display. Shows message previews with sender info and conversation context.",
        parameters: {
          limit: "Maximum number of recent unread messages to return (default: 3, max: 10)"
        },
        required: []
      },
      markConversationAsRead: {
        description: "Mark all messages in a specific conversation as read. Used when user opens a conversation from the widget.",
        parameters: {
          conversationId: "Conversation ID - for channels use C1234567890, for DMs use D1234567890 (NOT the user ID). Use the actual conversation ID from listConversations or getRecentUnreadMessages."
        },
        required: ["conversationId"]
      },
      updateMessage: {
        description: "Edit/update an existing message. You can only edit messages you sent.",
        parameters: {
          conversationId: "Channel ID (e.g. C1234567890) where the message is located",
          messageTs: "Message timestamp (e.g. '1234567890.123456') of the message to update",
          text: "New text content for the message",
          blocks: "Optional Slack Block Kit blocks for rich formatting"
        },
        required: ["conversationId", "messageTs"]
      },
      deleteMessage: {
        description: "Delete a message. You can only delete messages you sent (unless you're an admin).",
        parameters: {
          conversationId: "Channel ID (e.g. C1234567890) where the message is located",
          messageTs: "Message timestamp (e.g. '1234567890.123456') of the message to delete"
        },
        required: ["conversationId", "messageTs"]
      },
      getMessagePermalink: {
        description: "Get a shareable permalink URL for a specific message",
        parameters: {
          conversationId: "Channel ID (e.g. C1234567890) where the message is located",
          messageTs: "Message timestamp (e.g. '1234567890.123456') of the message"
        },
        required: ["conversationId", "messageTs"]
      },
      listFiles: {
        description: "List files shared in Slack workspace. Can filter by channel, file type, and pagination.",
        parameters: {
          conversationId: "Optional channel ID to filter files from specific channel",
          types: "Optional comma-separated list of file types to filter (e.g. 'images,documents,archives')",
          limit: "Number of files to return (default: 20, max: 100)",
          page: "Page number for pagination (starts at 1)"
        },
        required: []
      },
      uploadFile: {
        description: "Upload a file to a Slack channel or DM. Note: This requires file content to be provided through the system.",
        parameters: {
          conversationId: "Channel ID (e.g. C1234567890) to upload the file to",
          filename: "Name of the file including extension (e.g. 'document.pdf')",
          title: "Optional title for the file",
          initialComment: "Optional comment to post with the file",
          filetype: "Optional file type hint (e.g. 'pdf', 'text', 'image')"
        },
        required: ["conversationId", "filename"]
      },
      getConversationMembers: {
        description: "Get list of members in a conversation/channel",
        parameters: {
          conversationId: "Channel ID (e.g. C1234567890) to get members from",
          limit: "Maximum number of members to return (default: 100, max: 1000)"
        },
        required: ["conversationId"]
      },
      createConversation: {
        description: "Create a new channel or group conversation",
        parameters: {
          name: "Name of the new conversation/channel",
          isPrivate: "Whether the channel should be private (true) or public (false)",
          memberUserIds: "Optional array of user IDs to invite to the conversation"
        },
        required: ["name"]
      },
      joinConversation: {
        description: "Join a public channel",
        parameters: {
          conversationId: "Channel ID (e.g. C1234567890) or channel name (e.g. 'general' or '#general') to join"
        },
        required: ["conversationId"]
      },
      leaveConversation: {
        description: "Leave a channel or group",
        parameters: {
          conversationId: "Channel ID (e.g. C1234567890), channel name (e.g. 'general' or '#general'), or group ID to leave"
        },
        required: ["conversationId"]
      }
    };

    const prompt = `You are an AI assistant that parses natural language commands and maps them to Slack function calls.

Available Slack Functions:
${JSON.stringify(functionsManifest, null, 2)}

User Command: "${command}"

Your task is to:
1. Understand what the user wants to do
2. Map it to the most appropriate Slack function
3. Extract any parameters from the natural language

Rules:
- Channel names starting with # should be preserved as-is (e.g. #general, #random)
- User mentions starting with @ should be preserved as-is (e.g. @username)
- If a channel is mentioned without #, add it (e.g. "general" becomes "#general")
- Use reasonable defaults for optional parameters (e.g. limit: 10 for messages)
- If the command is unclear or doesn't match any function, return null

Return ONLY a JSON object in this exact format:
{
  "functionName": "exactFunctionName",
  "params": {
    "parameterName": "value"
  }
}

Or return null if no function matches.

Examples:
- "send a message to #general saying hello" → {"functionName": "sendMessage", "params": {"channel": "#general", "text": "hello"}}
- "get recent messages from random" → {"functionName": "getMessages", "params": {"channel": "#random", "limit": 10}}
- "list conversations" → {"functionName": "listConversations", "params": {}}
- "search for messages about project" → {"functionName": "searchMessages", "params": {"query": "project", "count": 20}}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    console.log(`🤖 GEMINI AI: Parsed command "${command}" → ${text}`);

    // Try to parse the AI response as JSON
    try {
      // Remove any markdown code block formatting if present
      const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
      
      if (cleanText === 'null') {
        return null;
      }

      const parsed = JSON.parse(cleanText);
      
      // Validate the response structure
      if (parsed && typeof parsed === 'object' && parsed.functionName && parsed.params) {
        return {
          functionName: parsed.functionName,
          params: parsed.params
        };
      }
      
      return null;
    } catch (parseError) {
      console.warn('🤖 GEMINI AI: Failed to parse AI response as JSON, falling back to pattern matching');
      return parseNaturalLanguageCommandFallback(command);
    }

  } catch (error: any) {
    console.error('🤖 GEMINI AI: Error calling Gemini API:', error.message);
    // Fall back to basic pattern matching if AI fails
    return parseNaturalLanguageCommandFallback(command);
  }
}

/**
 * Fallback pattern matching for natural language commands
 * Used when Gemini API is not available or fails
 */
function parseNaturalLanguageCommandFallback(command: string): { functionName: string; params: any } | null {
  const lowerCommand = command.toLowerCase().trim()
  
  // Send message patterns
  if (lowerCommand.includes('send') && (lowerCommand.includes('message') || lowerCommand.includes('say'))) {
    const channelMatch = lowerCommand.match(/(?:to|in)\s+([#@]\w+|\w+)/i)
    const textMatch = lowerCommand.match(/(?:saying?|message)\s+["']?([^"']+)["']?/i)
    
    if (channelMatch && textMatch) {
      let channel = channelMatch[1];
      // Add # if not present and it's not a user mention
      if (!channel.startsWith('#') && !channel.startsWith('@')) {
        channel = '#' + channel;
      }
      return {
        functionName: 'sendMessage',
        params: {
          channel: channel,
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
        let channel = channelMatch[1];
        // Add # if not present and it's not a user mention
        if (!channel.startsWith('#') && !channel.startsWith('@')) {
          channel = '#' + channel;
        }
        return {
          functionName: 'getMessages',
          params: {
            channel: channel,
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