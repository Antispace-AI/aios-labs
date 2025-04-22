import type { AntispaceMetadata } from "@antispace/sdk"
import { eq } from "drizzle-orm"
import Replicate from "replicate"
import db from "../../../db"
import { type User, generations, users } from "../../../db/schema"

const getUser = async (userID: string) => {
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

export const setReplicateKey = async (replicateKey: string, anti: AntispaceMetadata) => {
  const user = await getUser(anti.user.id)

  if (!user || !user.id) {
    throw new Error("User not found")
  }

  let message = "Replicate key set"

  if (user.replicateKey) {
    message = "Replicate key changed"
  }

  user.replicateKey = replicateKey
  await db.update(users).set(user).where(eq(users.id, user.id))

  return message
}

export const generateWallpaper = async (prompt: string, anti: AntispaceMetadata) => {
  const user = await getUser(anti.user.id)

  if (!user || !user.id) {
    throw new Error("User not found")
  }

  if (!user.replicateKey) {
    throw new Error("Replicate key not set")
  }

  const replicate = new Replicate({
    auth: user.replicateKey || undefined,
  })

  // Configure image generation parameters
  const input = {
    prompt,
    raw: false,
    aspect_ratio: "3:2",
    output_format: "jpg",
    safety_tolerance: 2,
    image_prompt_strength: 0.1,
  }

  // Generate image using Replicate's Flux model
  const output = await replicate.run("black-forest-labs/flux-1.1-pro-ultra", { input })

  // Save generated image to database
  await db.insert(generations).values({
    prompt,
    result: output.toString(),
    userId: user.id,
  })

  return output.toString()
}
