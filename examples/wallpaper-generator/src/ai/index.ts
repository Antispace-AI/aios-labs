import type { AntispaceAIRequest } from "@antispace/sdk"
import type { Context } from "hono"
import type { manifest } from "../manifest"
import { generateWallpaper, setReplicateKey } from "./actions"

export default async function aiActions(c: Context) {
  const { name, parameters, meta } = (await c.req.json()) as AntispaceAIRequest<typeof manifest>

  switch (name) {
    case "set_replicate_key": {
      const { replicateKey } = parameters

      try {
        const message = await setReplicateKey(replicateKey, anti)
        return c.json({ success: true, message })
      } catch (e: any) {
        return c.json({ error: e.message || e.toString() || e })
      }
    }
    case "generate_wallpaper": {
      const { prompt } = parameters
      const outputURL = await generateWallpaper(prompt, anti)

      return c.json({ success: true, image: outputURL, prompt })
    }
    default: {
      break
    }
  }
}
