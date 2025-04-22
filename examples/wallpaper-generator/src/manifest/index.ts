import type { AntispaceAppManifest } from "@antispace/sdk"
import * as functions from "./functions"

/**
 * Manifest configuration for the Wallpaper Generator mod.
 */
export const manifest: AntispaceAppManifest<typeof functions> = {
  name: "Wallpaper Generator",
  slug: "wallpaper-generator",
  wantsPage: false,
  wantsRefresh: false,
  hotkey: "t",
  functions,
}
