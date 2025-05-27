import type { Context } from "hono"
import { getCookie } from "hono/cookie"
import { updateUserTokens } from "../../util"
import { BASE_URL, ANTISPACE_URL, IS_PRODUCTION, SLACK_CLIENT_ID, SLACK_CLIENT_SECRET } from "../../config/simple"

/**
 * OAuth callback endpoint for Slack authentication
 * This endpoint receives the authorization code from Slack and exchanges it for access tokens
 * 
 * IMPORTANT: This endpoint must be accessible via HTTPS for production Slack apps.
 */
export default async function handler(c: Context) {
  try {
    // Get userId from cookies
    const userId = getCookie(c, "antispace_user_id")
    const code = c.req.query("code") as string
    const state = c.req.query("state") as string
    const error = c.req.query("error")

    const redirectUri = `${BASE_URL}/authenticate-slack/callback`

    // Check for OAuth errors
    if (error) {
      console.error("Slack OAuth error:", error)
      return c.redirect(`${ANTISPACE_URL}/me?error=slack_auth_failed`)
    }

    // Validate required parameters
    if (!userId || !code) {
      console.error("Missing required parameters:", { userId: !!userId, code: !!code })
      return c.redirect(`${ANTISPACE_URL}/me?error=missing_parameters`)
    }

    // Verify state parameter for security
    if (state !== userId) {
      console.error("State parameter mismatch:", { expected: userId, received: state })
      return c.redirect(`${ANTISPACE_URL}/me?error=invalid_state`)
    }

    console.log(`Processing OAuth callback for user ${userId}`)
    console.log(`Using redirect URI: ${redirectUri}`)

    // Exchange authorization code for access token
    const tokenResponse = await fetch("https://slack.com/api/oauth.v2.access", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: SLACK_CLIENT_ID,
        client_secret: SLACK_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error(`Slack API error: ${tokenResponse.status} ${tokenResponse.statusText}`)
    }

    const tokenData = await tokenResponse.json()

    if (!tokenData.ok) {
      throw new Error(`Slack OAuth error: ${tokenData.error}`)
    }

    // Extract relevant data from Slack response
    const {
      access_token: accessToken,
      refresh_token: refreshToken,
      team: { id: teamId, name: teamName },
      authed_user: { id: slackUserId, access_token: userAccessToken },
    } = tokenData

    // For user tokens, use the user access token instead of app access token
    const finalAccessToken = userAccessToken || accessToken

    // Get user info for display name
    let userName = undefined
    try {
      const userInfoResponse = await fetch("https://slack.com/api/users.info", {
        headers: {
          "Authorization": `Bearer ${finalAccessToken}`,
        },
        method: "POST",
        body: new URLSearchParams({
          user: slackUserId,
        }),
      })
      
      if (userInfoResponse.ok) {
        const userInfo = await userInfoResponse.json()
        if (userInfo.ok) {
          userName = userInfo.user?.real_name || userInfo.user?.display_name || userInfo.user?.name
        }
      }
    } catch (userInfoError) {
      console.warn("Failed to fetch user info:", userInfoError)
      // Continue without user name - it's not critical
    }

    // Store tokens in database
    await updateUserTokens(
      userId,
      finalAccessToken,  // Use user token
      refreshToken,
      teamId,
      teamName,
      slackUserId,
      userName
    )

    console.log(`Successfully authenticated Slack for user ${userId} in team ${teamName}`)

    // Redirect back to Antispace
    return c.redirect(`${ANTISPACE_URL}/me?success=slack_connected`)

  } catch (error) {
    console.error("OAuth callback error:", error)
    return c.redirect(`${ANTISPACE_URL}/me?error=auth_failed`)
  }
} 