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
