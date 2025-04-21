import type { AntispaceAppManifest } from "@antispace/sdk";
import * as functions from "./functions";

/**
 * Manifest configuration for the app.
 */
const manifest: AntispaceAppManifest<typeof functions> = {
	name: "Anti Spotify",
	slug: "my-anti-spotify",
	wantsPage: false,
	wantsRefresh: true,
	hotkey: "a",
	functions,
};

export default manifest;
