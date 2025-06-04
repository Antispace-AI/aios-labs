import type { AntispaceAppFunction } from "@antispace/sdk"

/**
 * MSG-002: Send a message to a Slack channel or DM
 */
export const sendMessage: AntispaceAppFunction<
  "sendMessage",
  {
    channel: string
    text: string
    threadTs?: string
  }
> = {
  type: "function",
  function: {
    name: "sendMessage",
    description: "Send a message to a Slack channel, DM, or group. Can optionally reply in a thread.",
    parameters: {
      type: "object",
      properties: {
        channel: {
          type: "string",
          description: "Channel ID (e.g. C1234567890), user ID for DM (e.g. U1234567890), or channel name (e.g. #general)",
        },
        text: {
          type: "string",
          description: "Message text to send. Supports Slack markdown formatting.",
        },
        threadTs: {
          type: "string",
          description: "Optional timestamp of parent message to reply in thread",
        },
      },
      required: ["channel", "text"],
    },
  },
}

/**
 * CONV-001: List conversations
 */
export const listConversations: AntispaceAppFunction<
  "listConversations",
  {
    types?: string
    limit?: number
  }
> = {
  type: "function",
  function: {
    name: "listConversations",
    description: "List Slack conversations (channels, DMs, groups) that the user has access to",
    parameters: {
      type: "object",
      properties: {
        types: {
          type: "string",
          description: "Comma-separated list of conversation types to include: public_channel, private_channel, im, mpim. Default: all types",
        },
        limit: {
          type: "number",
          description: "Maximum number of conversations to return (default: 100, max: 1000)",
        },
      },
      required: [],
    },
  },
}

/**
 * MSG-001: Get recent messages from a specific channel
 */
export const getMessages: AntispaceAppFunction<
  "getMessages",
  {
    channel: string
    limit?: number
    oldest?: string
    latest?: string
  }
> = {
  type: "function",
  function: {
    name: "getMessages",
    description: "Fetch recent messages from a specific Slack channel or DM",
    parameters: {
      type: "object",
      properties: {
        channel: {
          type: "string",
          description: "Channel ID (e.g. C1234567890) or user ID for DM (e.g. U1234567890)",
        },
        limit: {
          type: "number",
          description: "Number of messages to fetch (default: 10, max: 1000)",
        },
        oldest: {
          type: "string",
          description: "Only messages after this timestamp (inclusive)",
        },
        latest: {
          type: "string",
          description: "Only messages before this timestamp (exclusive)",
        },
      },
      required: ["channel"],
    },
  },
}

/**
 * SRCH-001: Search for messages across accessible channels
 */
export const searchMessages: AntispaceAppFunction<
  "searchMessages",
  {
    query: string
    sort?: string
    count?: number
  }
> = {
  type: "function",
  function: {
    name: "searchMessages",
    description: "Search for messages across all accessible Slack channels and DMs",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query. Supports Slack search syntax (e.g. 'from:@user', 'in:#channel', 'has:link')",
        },
        sort: {
          type: "string",
          description: "Sort order: 'timestamp' (default) or 'score'",
        },
        count: {
          type: "number",
          description: "Number of messages to return (default: 20, max: 100)",
        },
      },
      required: ["query"],
    },
  },
}

/**
 * USER-001: Get user profile by user ID
 */
export const getUserProfile: AntispaceAppFunction<
  "getUserProfile",
  {
    user: string
  }
> = {
  type: "function",
  function: {
    name: "getUserProfile",
    description: "Get detailed profile information about a Slack user by their user ID",
    parameters: {
      type: "object",
      properties: {
        user: {
          type: "string",
          description: "User ID (e.g. U1234567890)",
        },
      },
      required: ["user"],
    },
  },
}

/**
 * CONV-002: Get detailed information about a conversation
 */
export const getConversationDetails: AntispaceAppFunction<
  "getConversationDetails",
  {
    channel: string
  }
> = {
  type: "function",
  function: {
    name: "getConversationDetails",
    description: "Get detailed information about a specific channel or conversation",
    parameters: {
      type: "object",
      properties: {
        channel: {
          type: "string",
          description: "Channel ID (e.g. C1234567890) or user ID for DM (e.g. U1234567890)",
        },
      },
      required: ["channel"],
    },
  },
}

/**
 * Get Slack OAuth authentication URL
 */
export const getAuthUrl: AntispaceAppFunction<
  "getAuthUrl",
  {}
> = {
  type: "function",
  function: {
    name: "getAuthUrl",
    description: "Get the Slack OAuth URL to authenticate your account. Visit this URL in your browser to connect your Slack workspace.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
}

/**
 * Check current authentication status
 */
export const checkAuthStatus: AntispaceAppFunction<
  "checkAuthStatus",
  {}
> = {
  type: "function",
  function: {
    name: "checkAuthStatus",
    description: "Check if your Slack account is currently authenticated and get basic info about your connected workspace.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
}

/**
 * Manual authentication with token (for testing)
 */
export const manualAuth: AntispaceAppFunction<
  "manualAuth",
  {
    accessToken: string
    teamName?: string
  }
> = {
  type: "function",
  function: {
    name: "manualAuth",
    description: "Manually authenticate with a Slack bot token (for testing purposes). Use this only if you have a bot token from your Slack app settings.",
    parameters: {
      type: "object",
      properties: {
        accessToken: {
          type: "string",
          description: "Slack bot token (starts with xoxb-)",
        },
        teamName: {
          type: "string",
          description: "Optional team/workspace name for display purposes",
        },
      },
      required: ["accessToken"],
    },
  },
}

/**
 * PHASE 1 FUNCTIONS - Widget Functions
 */

/**
 * RT-001: Get total unread summary for widget display
 */
export const getTotalUnreadSummary: AntispaceAppFunction<
  "getTotalUnreadSummary",
  {}
> = {
  type: "function",
  function: {
    name: "getTotalUnreadSummary",
    description: "Get the total count of unread messages across all conversations, broken down by type (DMs, channels, mentions) for widget display",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
}

/**
 * RT-002: Get recent unread messages for widget preview
 */
export const getRecentUnreadMessages: AntispaceAppFunction<
  "getRecentUnreadMessages",
  {
    limit?: number
  }
> = {
  type: "function",
  function: {
    name: "getRecentUnreadMessages",
    description: "Get the most recent unread messages for widget preview display. Shows message previews with sender info and conversation context.",
    parameters: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Maximum number of recent unread messages to return (default: 3, max: 10)",
        },
      },
      required: [],
    },
  },
}

/**
 * RT-003: Mark a conversation as read
 */
export const markConversationAsRead: AntispaceAppFunction<
  "markConversationAsRead",
  {
    conversationId: string
  }
> = {
  type: "function",
  function: {
    name: "markConversationAsRead",
    description: "Mark all messages in a specific conversation as read. Used when user opens a conversation from the widget.",
    parameters: {
      type: "object",
      properties: {
        conversationId: {
          type: "string",
          description: "Conversation ID - for channels use C1234567890, for DMs use D1234567890 (NOT the user ID). Use the actual conversation ID from listConversations or getRecentUnreadMessages.",
        },
      },
      required: ["conversationId"],
    },
  },
}

/**
 * CONV-012: Get all threads in a conversation
 */
export const getConversationThreads: AntispaceAppFunction<
  "getConversationThreads",
  {
    conversationId: string
    includeRead?: boolean
    minReplies?: number
    since?: string
  }
> = {
  type: "function",
  function: {
    name: "getConversationThreads",
    description: "Get list of all thread conversations in a channel with metadata about replies, participants, and read status",
    parameters: {
      type: "object",
      properties: {
        conversationId: {
          type: "string",
          description: "Channel ID (e.g. C1234567890) to get threads from",
        },
        includeRead: {
          type: "boolean",
          description: "If true, include threads that have been read (default: true)",
        },
        minReplies: {
          type: "number",
          description: "Only return threads with at least this many replies (default: 1)",
        },
        since: {
          type: "string",
          description: "Only return threads created since this timestamp",
        },
      },
      required: ["conversationId"],
    },
  },
}
