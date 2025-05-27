import type { AntispaceAppManifest } from "@antispace/sdk"
import * as functions from "./functions"

/**
 * Manifest configuration for the Slack integration app.
 */
const manifest: AntispaceAppManifest<typeof functions> = {
  name: "Slack",
  slug: "slack",
  wantsPage: false,
  wantsRefresh: true,
  hotkey: "s",
  functions,
}

export default manifest
