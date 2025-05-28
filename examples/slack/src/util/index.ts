import db, { type UserData } from "./db"

export type User = UserData

/**
 * Get or create a user by their Antispace user ID
 */
export const getUser = async (userID: string): Promise<User> => {
  // First, try to get existing user
  const existingUser = await db.getUser(userID)

  if (existingUser) {
    return existingUser
  }

  // User doesn't exist, create a new one
  console.log(`Creating new user record for ${userID}`)
  return await db.createUser(userID)
}

/**
 * Check if a user is authenticated with Slack
 */
export const isUserAuthenticated = async (userID: string): Promise<boolean> => {
  try {
    const user = await db.getUser(userID)
    return !!(user && user.accessToken && user.accessToken.trim().length > 0)
  } catch (error) {
    console.error(`Error checking authentication for user ${userID}:`, error)
    return false
  }
}

/**
 * Clear user's Slack authentication tokens (logout)
 */
export const clearUserTokens = async (userID: string): Promise<boolean> => {
  try {
    const user = await db.getUser(userID)
    if (!user) {
      return false // User doesn't exist
    }

    // Explicitly set auth-related fields to undefined to clear them
    await db.updateUser(userID, {
      accessToken: undefined,
      refreshToken: undefined,
      teamId: undefined,
      teamName: undefined,
      userId: undefined,
      userName: undefined,
    })

    console.log(`Successfully cleared tokens for user ${userID}`)
    return true
  } catch (error) {
    console.error(`Error clearing tokens for user ${userID}:`, error)
    return false
  }
}

/**
 * Update user's Slack authentication tokens
 */
export const updateUserTokens = async (
  userID: string, 
  accessToken: string, 
  refreshToken?: string,
  teamId?: string,
  teamName?: string,
  userId?: string,
  userName?: string
): Promise<User> => {
  try {
    return await db.updateUser(userID, {
      accessToken,
      refreshToken,
      teamId,
      teamName,
      userId,
      userName,
    })
  } catch (error) {
    // If user doesn't exist, create them first
    if (error instanceof Error && error.message.includes("not found")) {
      console.log(`User ${userID} not found, creating new user`)
      await db.createUser(userID)
      return await db.updateUser(userID, {
        accessToken,
        refreshToken,
        teamId,
        teamName,
        userId,
        userName,
      })
    }
    throw error
  }
} 