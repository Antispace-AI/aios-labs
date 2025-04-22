import db from "./db"

export type User = {
  id: number
  accessToken: string
  refreshToken: string
  apiKey?: string | null
  filter: string
}

export const getUser = async (userID: string): Promise<User> => {
  // select user by id
  const dbUser = await db.from("users").select().eq("antiId", userID)

  const user = dbUser.data?.[0]

  if (!user) {
    await db.from("users").insert({
      antiId: userID,
      filter: "assigned",
    })

    const user = await db.from("users").select().eq("antiId", userID)

    return user.data?.[0]
  }

  return user
}
