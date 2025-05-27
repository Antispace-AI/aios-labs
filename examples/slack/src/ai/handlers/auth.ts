import { updateUserTokens } from "../../util"
import type { User } from "../../util"
import { BASE_URL, IS_PRODUCTION } from "../../config/simple"

/**
 * Authentication action handlers
 */

export async function handleAuthenticationActions(
  name: string,
  parsedParams: any,
  user: User,
  userId: string
): Promise<any> {
  console.log("🔍 Handling authentication action:", name)

  switch (name) {
    case "get_auth_url": {
      console.log(`Generating OAuth URL for user ${userId}`)
      
      // Instead of generating OAuth URL directly, redirect through our initiation endpoint
      // This ensures the userId cookie gets set properly
      const authInitUrl = `${BASE_URL}/authenticate-slack?userId=${encodeURIComponent(userId)}`

      return {
        success: true,
        auth_url: authInitUrl,
        instructions: [
          "1. Click or copy the URL above and open it in your browser",
          "2. You'll be automatically redirected to Slack for authorization",
          "3. Select your Slack workspace and click 'Allow'", 
          "4. You'll be redirected back automatically",
          "5. Use 'check_auth_status' to verify authentication worked"
        ],
        note: IS_PRODUCTION ? "🔒 Using HTTPS for production" : "🔧 Using HTTP for development",
        technical_note: "This URL will set necessary cookies and then redirect you to Slack"
      }
    }

    case "check_auth_status": {
      console.log(`✅ Starting check_auth_status for user ${userId}`)
      
      if (!user.accessToken) {
        console.log("❌ User has no access token")
        return {
          authenticated: false,
          message: "Not authenticated with Slack",
          next_step: "Use 'get_auth_url' to get authentication URL, or 'manual_auth' with a bot token"
        }
      }

      console.log("🔑 User has access token, returning success")
      const result = {
        authenticated: true,
        message: "Successfully authenticated with Slack!",
        team_name: user.teamName || "Unknown",
        team_id: user.teamId || "Unknown", 
        user_name: user.userName || "Unknown",
        slack_user_id: user.userId || "Unknown",
        token_preview: user.accessToken ? `${user.accessToken.substring(0, 12)}...` : "No token",
        next_steps: [
          "You can now use Slack functions like:",
          "• get_conversations - List your channels and DMs",
          "• send_message - Send messages to channels",
          "• get_messages - Read message history"
        ]
      }
      console.log("📤 Returning auth status result:", result)
      return result
    }

    case "manual_auth": {
      const { access_token, team_name } = parsedParams as any
      console.log(`Manual authentication for user ${userId}`)
      
      if (!access_token.startsWith("xoxp-") && !access_token.startsWith("xoxb-")) {
        return {
          error: "Invalid token format", 
          message: "Slack tokens should start with 'xoxp-' (user token) or 'xoxb-' (bot token)",
          help: "Get your token from: Slack App Settings → OAuth & Permissions → User OAuth Token or Bot User OAuth Token"
        }
      }

      try {
        // Test the token by making a simple API call
        const testClient = new (await import("@slack/web-api")).WebClient(access_token)
        const authTest = await testClient.auth.test()
        
        if (!authTest.ok) {
          throw new Error(`Invalid token: ${authTest.error}`)
        }

        // Update user with token info
        await updateUserTokens(
          userId,
          access_token,
          undefined, // no refresh token for manual auth
          authTest.team_id,
          team_name || authTest.team,
          authTest.user_id,
          authTest.user
        )

        const tokenType = access_token.startsWith("xoxp-") ? "User Token" : "Bot Token"

        return {
          success: true,
          message: "Manual authentication successful!",
          token_type: tokenType,
          team: authTest.team,
          user: authTest.user,
          team_id: authTest.team_id,
          user_id: authTest.user_id,
          note: tokenType === "User Token" ? "Messages will be sent as your user account" : "Messages will be sent as bot",
          next_steps: [
            "Authentication complete! You can now use:",
            "• get_conversations",
            "• send_message", 
            "• get_messages",
            "• And other Slack functions"
          ]
        }
      } catch (error: any) {
        return {
          error: "Authentication failed",
          message: error.message,
          help: "Verify your token is correct and has the required scopes"
        }
      }
    }

    default: {
      return { error: `Unknown authentication function: ${name}` }
    }
  }
} 