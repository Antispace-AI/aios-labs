import {
	getClientCredentialsToken,
	ensureAccessToken,
	spotifyClient,
} from "./config";

export function isConfigured() {
	const hasClientId = Boolean(process.env.SPOTIFY_CLIENT_ID);
	const hasClientSecret = Boolean(process.env.SPOTIFY_CLIENT_SECRET);
	console.log(
		`Spotify configuration check - Client ID: ${hasClientId ? "✓" : "✗"}, Client Secret: ${hasClientSecret ? "✓" : "✗"}`,
	);
	return hasClientId && hasClientSecret;
}

export async function getNewAccessToken() {
	try {
		const token = await ensureAccessToken();
		console.log("Access token obtained");
		return token;
	} catch (error) {
		console.error("Error getting access token:", error);
		return null;
	}
}
