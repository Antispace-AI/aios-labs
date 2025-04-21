//@ts-nocheck
import type { AntispaceAppManifest } from "@antispace/sdk";
import * as functions from "./functions";

/**
 * Manifest configuration for the app
 */
const manifest: AntispaceAppManifest<typeof functions> = {
	name: "My Antispace App",
	slug: "my-antispace-app",
	wantsPage: false,
	wantsRefresh: false,
	hotkey: "a",
	functions,
};

export default manifest;
