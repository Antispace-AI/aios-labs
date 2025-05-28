import { components as Anti, type AntispaceContext } from "@antispace/sdk"
import type { SlackUIActions } from "../../types"
import { isUserAuthenticated, getUser, clearUserTokens } from "../util"
import { BASE_URL } from "../config/simple"

/**
 * Main widget UI component that handles Slack authentication and basic functionality
 * @param anti - Antispace Context object containing request details
 * @returns JSX markup string response
 */
export default async function widgetUI(anti: AntispaceContext<SlackUIActions>) {
  const { action, values, meta } = anti
  const userId = meta.user.id

  // Handle logout action directly
  if (action === "logout_slack") {
    // Clear tokens immediately
    const success = await clearUserTokens(userId)
    
    return (
      <Anti.Column align="center" justify="center">
        <Anti.Text align="center" type="heading3">
          {success ? "🔐 Disconnected Successfully" : "❌ Logout Failed"}
        </Anti.Text>
        <Anti.Text type="dim" align="center">
          {success 
            ? "Your Slack account has been disconnected. Refresh to see the updated status."
            : "There was an error disconnecting your account. Please try again."
          }
        </Anti.Text>
        {success && (
          <Anti.Text type="caption" align="center">
            You can now connect a different Slack account or use the disconnect URL if needed.
          </Anti.Text>
        )}
      </Anti.Column>
    )
  }

  // Check authentication status
  const isAuthenticated = await isUserAuthenticated(userId)
  
  if (!isAuthenticated) {
    // Show login interface with automatic redirect
    return (
      <Anti.Column align="center" justify="center">
        <Anti.Text align="center" type="heading2">
          🔗 Slack Integration
        </Anti.Text>
        <Anti.Text align="center" type="dim">
          Connect your Slack account to send messages and interact with your workspace.
        </Anti.Text>
        <Anti.Button 
          action={`antispace:open_external_url:${BASE_URL}/authenticate-slack?userId=${userId}`}
          text="Connect Slack Account"
        />
        <Anti.Text type="caption" align="center">
          Or use AI command: "get me the Slack auth URL"
        </Anti.Text>
        <Anti.Button 
          action="check_auth_status" 
          text="Refresh Status"
          size="small"
        />
      </Anti.Column>
    )
  }

  // User is authenticated - show the main interface
  const user = await getUser(userId)
  
  return (
    <Anti.Column>
      <Anti.Row justify="space-between" align="center">
        <Anti.Column>
          <Anti.Text type="heading2">🔗 Slack</Anti.Text>
          {user.teamName && (
            <Anti.Text type="caption">
              Connected to {user.teamName}
            </Anti.Text>
          )}
          {user.userName && (
            <Anti.Text type="caption">
              Logged in as {user.userName}
            </Anti.Text>
          )}
        </Anti.Column>
        <Anti.Button 
          action="logout_slack" 
          text="Disconnect"
          size="small"
        />
      </Anti.Row>

      <Anti.Text align="center" type="dim">
        You can now use AI commands to interact with Slack:
      </Anti.Text>
      
      <Anti.Column>
        <Anti.Text type="caption">• "Send a message to #general"</Anti.Text>
        <Anti.Text type="caption">• "Show me recent messages from #random"</Anti.Text>
        <Anti.Text type="caption">• "Get my Slack conversations"</Anti.Text>
        <Anti.Text type="caption">• "Search for messages about project"</Anti.Text>
      </Anti.Column>

      <Anti.Button 
        action="check_auth_status" 
        text="Refresh Status"
        size="small"
      />
    </Anti.Column>
  )
}