import { components as Anti, type AntispaceUIRequest } from "@antispace/sdk"
import { eq } from "drizzle-orm"
import type { Context } from "hono"
import Replicate from "replicate"
import db from "../../db"
import { type Generation, type User, generations, users } from "../../db/schema"
import type { WallpaperGeneratorActions } from "../types"
import { getUser } from "../utils"

/**
 * Generates and stores a wallpaper image using the Replicate API
 * @param user - User object containing the Replicate API key and user ID
 * @param prompt - Text prompt describing the desired wallpaper image
 * @returns Promise that resolves when the wallpaper is generated and stored
 */
async function generateWallpaper(user: User, prompt: string) {
  // Initialize Replicate client with user's API key
  const replicate = new Replicate({
    auth: user.replicateKey || undefined,
  })

  // Configure image generation parameters
  const input = {
    raw: false,
    prompt,
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
}

/**
 * Main widget UI component that handles user interactions and renders the wallpaper generator interface
 * @param c - Hono Context object containing request details
 * @returns JSX markup string response with either API key input form or main wallpaper generator UI
 */
export default async function widgetUI(c: Context) {
  // Use the AntispaceRequest type with the action pairs we defined above to ensure the action and values are properly typed
  const { action, values, meta } = (await c.req.json()) as AntispaceUIRequest<WallpaperGeneratorActions>

  // Get User ID from Antispace metadata
  let user = await getUser(meta.user.id)

  // MARK: - Handle actions
  switch (action) {
    case "set_replicate_key": {
      // Store user's Replicate API key
      user.replicateKey = values.replicateKey
      await db.update(users).set(user).where(eq(users.id, user.id))

      break
    }
    case "generate": {
      await generateWallpaper(user, values.prompt)

      break
    }
    case "delete_all_generations": {
      // Remove all generated images from database
      await db.delete(generations)

      break
    }
    case "delete_replicate_key": {
      // Clear user's Replicate API key
      await db.update(users).set({ replicateKey: null }).where(eq(users.id, user.id))
      ;[user] = await db.select().from(users).where(eq(users.id, user.id))

      break
    }
    default: {
      // Handle individual generation deletion
      if (action?.startsWith("delete_generation:")) {
        const id = action?.split(":")[1]
        await db.delete(generations).where(eq(generations.id, id))
      }

      break
    }
  }

  // MARK: Handle non-action UI states

  // Show API key input form if no key is set
  if (!user.replicateKey) {
    return c.html(
      <Anti.Column align="center">
        <Anti.Text type="heading1">Wallpaper Generator</Anti.Text>
        <Anti.Text>Please provide your Replicate API key:</Anti.Text>
        <Anti.Input placeholder="r8_*********************************" name="replicateKey" />
        <Anti.Button action="set_replicate_key" text="Save" />
      </Anti.Column>,
    )
  }

  // Fetch user's generated images
  const userGenerations = await db.select().from(generations).where(eq(generations.userId, user.id))

  // Render main wallpaper generator UI
  return c.html(
    <Anti.Column padding="medium">
      <Anti.Text type="heading1">Wallpaper Generator</Anti.Text>
      <Anti.Row>
        <Anti.Input placeholder="a lush nordic landscape" name="prompt" />
        <Anti.Button action="generate" text="generate" loadingText="Generating..." />
      </Anti.Row>
      <Anti.Divider />
      <Anti.Text type="subheading">{meta.user.name}'s Wapplapers</Anti.Text>

      {userGenerations?.length > 0 ? (
        userGenerations.reverse().map((generation: Generation) => (
          <Anti.Row justify="space-between" width="full" key={generation.result}>
            <Anti.Column width="full">
              <Anti.Text>{generation.prompt}</Anti.Text>
              <Anti.Row>
                <Anti.Button action={`antispace:open_external_url:${generation.result}`} text="Download" />
                <Anti.Button action={`delete_generation:${generation.id}`} type="danger" text="Delete" />
              </Anti.Row>
            </Anti.Column>
            {generation.result && <Anti.Image width={100} height={66} src={generation.result} />}
          </Anti.Row>
        ))
      ) : (
        <Anti.Text type="dim">No wallpapers generated yet yet</Anti.Text>
      )}
      <Anti.Divider />
      <Anti.Text type="subheading">Settings</Anti.Text>
      <Anti.Row>
        <Anti.Button text="Delete all wallpapers" type="secondary" action="delete_all_generations" />
        <Anti.Button text="Delete Replicate API key" type="negative" action="delete_replicate_key" />
      </Anti.Row>
    </Anti.Column>,
  )
}
