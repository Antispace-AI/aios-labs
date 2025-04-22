import { eq } from "drizzle-orm"
import db from "../../db"
import { type User, users } from "../../db/schema"

export const getUser = async (userID: string) => {
  let user: User
  const [existingUser] = await db.select().from(users).where(eq(users.id, userID))

  // Create a new user in SQLite if they don't exist, otherwise get the existing user
  if (!existingUser) {
    await db.insert(users).values({
      id: userID,
    })
    ;[user] = await db.select().from(users).where(eq(users.id, userID))
  } else {
    user = existingUser
  }

  return user
}
