import type { AntispaceAppFunction } from "@antispace/sdk"

/**
 * Function to set the user's Replicate API key for authentication
 */
export const set_replicate_key: AntispaceAppFunction<
  "set_replicate_key",
  {
    replicateKey: string
  }
> = {
  type: "function",
  function: {
    name: "set_replicate_key",
    description: "Set user's Replicate API key",
    parameters: {
      type: "object",
      properties: {
        replicateKey: {
          type: "string",
          description: "Replicate API key string",
        },
      },
      required: ["replicateKey"],
    },
  },
}

export const generate_wallpaper: AntispaceAppFunction<
  "generate_wallpaper",
  {
    prompt: string
  }
> = {
  type: "function",
  function: {
    name: "generate_wallpaper",
    description: "Generate wallpper from a prompt",
    parameters: {
      type: "object",
      properties: {
        prompt: {
          type: "string",
          description: "Wallpaper description prompt",
        },
      },
      required: ["prompt"],
    },
  },
}
