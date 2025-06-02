import type { AntispaceAppFunction } from "@antispace/sdk"

/**
 * Send a message to a Slack channel or DM
 */
export const send_message: AntispaceAppFunction<
  "send_message",
  {
    channel: string
    text: string
    thread_ts?: string
  }
> = {
  type: "function",
  function: {
    name: "send_message",
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
        thread_ts: {
          type: "string",
          description: "Optional timestamp of parent message to reply in thread",
        },
      },
      required: ["channel", "text"],
    },
  },
}

/**
 * Get list of accessible conversations
 */
export const get_conversations: AntispaceAppFunction<
  "get_conversations",
  {
    types?: string
    limit?: number
  }
> = {
  type: "function",
  function: {
    name: "get_conversations",
    description: "Get list of Slack conversations (channels, DMs, groups) that the user has access to",
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
 * Get recent messages from a specific channel
 */
export const get_messages: AntispaceAppFunction<
  "get_messages",
  {
    channel: string
    limit?: number
    oldest?: string
    latest?: string
  }
> = {
  type: "function",
  function: {
    name: "get_messages",
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
 * Search for messages across accessible channels
 */
export const search_messages: AntispaceAppFunction<
  "search_messages",
  {
    query: string
    sort?: string
    count?: number
  }
> = {
  type: "function",
  function: {
    name: "search_messages",
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
 * Get user information by user ID
 */
export const get_user_info: AntispaceAppFunction<
  "get_user_info",
  {
    user: string
  }
> = {
  type: "function",
  function: {
    name: "get_user_info",
    description: "Get detailed information about a Slack user by their user ID",
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
 * Get detailed information about a conversation
 */
export const get_conversation_info: AntispaceAppFunction<
  "get_conversation_info",
  {
    channel: string
  }
> = {
  type: "function",
  function: {
    name: "get_conversation_info",
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
export const get_auth_url: AntispaceAppFunction<
  "get_auth_url",
  {}
> = {
  type: "function",
  function: {
    name: "get_auth_url",
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
export const check_auth_status: AntispaceAppFunction<
  "check_auth_status",
  {}
> = {
  type: "function",
  function: {
    name: "check_auth_status",
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
export const manual_auth: AntispaceAppFunction<
  "manual_auth",
  {
    access_token: string
    team_name?: string
  }
> = {
  type: "function",
  function: {
    name: "manual_auth",
    description: "Manually authenticate with a Slack bot token (for testing purposes). Use this only if you have a bot token from your Slack app settings.",
    parameters: {
      type: "object",
      properties: {
        access_token: {
          type: "string",
          description: "Slack bot token (starts with xoxb-)",
        },
        team_name: {
          type: "string",
          description: "Optional team/workspace name for display purposes",
        },
      },
      required: ["access_token"],
    },
  },
}

/**
 * PHASE 1 FUNCTIONS - Widget Functions
 */

/**
 * Get total unread message count for widget display
 */
export const get_total_unread_count: AntispaceAppFunction<
  "get_total_unread_count",
  {}
> = {
  type: "function",
  function: {
    name: "get_total_unread_count",
    description: "Get the total count of unread messages across all conversations, broken down by type (DMs, channels, mentions) for widget display",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
}

/**
 * Get recent unread messages for widget preview
 */
export const get_recent_unread_messages: AntispaceAppFunction<
  "get_recent_unread_messages",
  {
    limit?: number
  }
> = {
  type: "function",
  function: {
    name: "get_recent_unread_messages",
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
 * Mark a conversation as read
 */
export const mark_conversation_read: AntispaceAppFunction<
  "mark_conversation_read",
  {
    conversation_id: string
  }
> = {
  type: "function",
  function: {
    name: "mark_conversation_read",
    description: "Mark all messages in a specific conversation as read. Used when user opens a conversation from the widget.",
    parameters: {
      type: "object",
      properties: {
        conversation_id: {
          type: "string",
          description: "Channel ID (e.g. C1234567890) or user ID for DM (e.g. U1234567890)",
        },
      },
      required: ["conversation_id"],
    },
  },
}

/**
 * PHASE 1 FUNCTIONS - Page UI Functions
 */

/**
 * Get conversations with enhanced metadata for page UI
 */
export const get_conversations_with_metadata: AntispaceAppFunction<
  "get_conversations_with_metadata",
  {
    type?: string
    unread_only?: boolean
    active_since?: string
  }
> = {
  type: "function",
  function: {
    name: "get_conversations_with_metadata",
    description: "Get list of conversations with enhanced metadata including unread counts, activity status, member counts, and more for page UI display",
    parameters: {
      type: "object",
      properties: {
        type: {
          type: "string",
          description: "Filter by conversation type: 'dm', 'channel', 'group', or 'all' (default: all)",
        },
        unread_only: {
          type: "boolean",
          description: "If true, only return conversations with unread messages (default: false)",
        },
        active_since: {
          type: "string",
          description: "Only return conversations active since this timestamp (ISO format)",
        },
      },
      required: [],
    },
  },
}

/**
 * Get messages with pagination for page UI
 */
export const get_messages_with_pagination: AntispaceAppFunction<
  "get_messages_with_pagination",
  {
    conversation_id: string
    cursor?: string
    limit?: number
    oldest?: string
    latest?: string
  }
> = {
  type: "function",
  function: {
    name: "get_messages_with_pagination",
    description: "Get paginated message history with enhanced metadata including threading info, reactions, files, and user details for page UI",
    parameters: {
      type: "object",
      properties: {
        conversation_id: {
          type: "string",
          description: "Channel ID (e.g. C1234567890) or user ID for DM (e.g. U1234567890)",
        },
        cursor: {
          type: "string",
          description: "Pagination cursor for getting next/previous page of messages",
        },
        limit: {
          type: "number",
          description: "Number of messages per page (default: 50, max: 200)",
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
      required: ["conversation_id"],
    },
  },
}

/**
 * Advanced message search with filters
 */
export const search_messages_advanced: AntispaceAppFunction<
  "search_messages_advanced",
  {
    query: string
    from_user?: string
    in_channel?: string
    date_from?: string
    date_to?: string
    has_files?: boolean
    has_links?: boolean
    message_type?: string
    sort_by?: string
    limit?: number
  }
> = {
  type: "function",
  function: {
    name: "search_messages_advanced",
    description: "Advanced message search with multiple filter parameters for precise results. Includes context around matches and relevance scoring.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query text",
        },
        from_user: {
          type: "string",
          description: "Filter messages from specific user (user ID or @username)",
        },
        in_channel: {
          type: "string",
          description: "Filter messages from specific channel (channel ID or #channel-name)",
        },
        date_from: {
          type: "string",
          description: "Search messages after this date (YYYY-MM-DD format)",
        },
        date_to: {
          type: "string",
          description: "Search messages before this date (YYYY-MM-DD format)",
        },
        has_files: {
          type: "boolean",
          description: "If true, only return messages with file attachments",
        },
        has_links: {
          type: "boolean",
          description: "If true, only return messages with links",
        },
        message_type: {
          type: "string",
          description: "Filter by message type: 'text', 'file', or 'all' (default: all)",
        },
        sort_by: {
          type: "string",
          description: "Sort results by: 'timestamp' (default) or 'relevance'",
        },
        limit: {
          type: "number",
          description: "Number of results to return (default: 20, max: 100)",
        },
      },
      required: ["query"],
    },
  },
}

/**
 * Get full thread conversation
 */
export const get_thread_messages: AntispaceAppFunction<
  "get_thread_messages",
  {
    conversation_id: string
    thread_ts: string
  }
> = {
  type: "function",
  function: {
    name: "get_thread_messages",
    description: "Get all messages in a specific thread including the root message and all replies with participant info and reactions",
    parameters: {
      type: "object",
      properties: {
        conversation_id: {
          type: "string",
          description: "Channel ID (e.g. C1234567890) where the thread exists",
        },
        thread_ts: {
          type: "string",
          description: "Timestamp of the thread root message",
        },
      },
      required: ["conversation_id", "thread_ts"],
    },
  },
}

/**
 * Get all threads in a conversation
 */
export const get_conversation_threads: AntispaceAppFunction<
  "get_conversation_threads",
  {
    conversation_id: string
    include_read?: boolean
    min_replies?: number
    since?: string
  }
> = {
  type: "function",
  function: {
    name: "get_conversation_threads",
    description: "Get list of all thread conversations in a channel with metadata about replies, participants, and read status",
    parameters: {
      type: "object",
      properties: {
        conversation_id: {
          type: "string",
          description: "Channel ID (e.g. C1234567890) to get threads from",
        },
        include_read: {
          type: "boolean",
          description: "If true, include threads that have been read (default: true)",
        },
        min_replies: {
          type: "number",
          description: "Only return threads with at least this many replies (default: 1)",
        },
        since: {
          type: "string",
          description: "Only return threads created since this timestamp",
        },
      },
      required: ["conversation_id"],
    },
  },
}
