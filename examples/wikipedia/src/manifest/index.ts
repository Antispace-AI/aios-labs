//@ts-nocheck
import type { AntispaceAppManifest } from "@antispace/sdk"
import * as functions from "./functions"

/**
 * Manifest configuration for the Wiki app
 */
const manifest: AntispaceAppManifest<typeof functions> = {
  name: "Wikipedia Integration",
  slug: "wiki-integration",
  wantsPage: false,
  wantsRefresh: false,
  hotkey: "w",
  functions,
}

export default manifest
