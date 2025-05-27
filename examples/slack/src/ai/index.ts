import type { AntispaceAIRequest } from "@antispace/sdk"
import type manifest from "../manifest"
import { getUser, updateUserTokens } from "../util"
import { sendMessage, getConversations, getMessages, searchMessages, getUserInfo, getConversationInfo } from "../util/slack"

// Extracted handler modules for better separation of concerns
import { handleAuthenticationActions } from './handlers/auth'
import { handleSlackActions } from './handlers/slack'
import { parseParameters } from './utils/parameterParser'
import { validateRequest } from './utils/validation'

export default async function aiActions({ name, parameters, meta }: AntispaceAIRequest<typeof manifest>) {
  try {
    console.log("🚀 AI Action called:", name)
    
    // Validate request
    const validation = validateRequest({ name, parameters, meta })
    if (!validation.isValid) {
      return { error: validation.error }
    }

    // Parse parameters with improved logic
    const parsedParams = parseParameters(parameters)
    console.log("🎯 Final parsedParams:", parsedParams)

    // Get user data
    const userId = meta.user.id
    const user = await getUser(userId)
    console.log("✅ Got user from database:", { id: user.id, hasToken: !!user.accessToken })

    // Route to appropriate handler
    if (isAuthenticationAction(name)) {
      return await handleAuthenticationActions(name, parsedParams, user, userId)
    }

    // For non-auth actions, ensure user is authenticated
    if (!user.accessToken) {
      return {
        error: "Not authenticated with Slack",
        action: "authenticate",
        message: "Please connect your Slack account first. Use 'get_auth_url' to get the authentication URL, or 'manual_auth' with a bot token."
      }
    }

    // Handle Slack actions
    return await handleSlackActions(name, parsedParams, user)

  } catch (error: any) {
    console.error(`Error in AI action ${name}:`, error)
    return {
      error: error.message || "An unexpected error occurred",
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }
  }
}

function isAuthenticationAction(name: string): boolean {
  return ['get_auth_url', 'check_auth_status', 'manual_auth'].includes(name)
}
