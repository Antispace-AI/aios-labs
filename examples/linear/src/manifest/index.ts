import type { AntispaceAppManifest } from "@antispace/sdk"
import * as functions from "./functions"

/**
 * Manifest configuration for the app.
 */
const manifest: AntispaceAppManifest<typeof functions> = {
  name: "Linear",
  slug: "linear",
  wantsPage: false,
  wantsRefresh: false,
  hotkey: "l",
  functions,
}

export default manifest
