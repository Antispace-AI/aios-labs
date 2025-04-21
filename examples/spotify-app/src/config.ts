import { SpotifyApi } from "@spotify/web-api-ts-sdk";

export const SPOTIFY_CONFIG = {
	clientId: process.env.SPOTIFY_CLIENT_ID || "",
	clientSecret: process.env.SPOTIFY_CLIENT_SECRET || "",
};

// Create the Spotify API client with client credentials
export const spotifyClient = SpotifyApi.withClientCredentials(
	SPOTIFY_CONFIG.clientId,
	SPOTIFY_CONFIG.clientSecret,
);

export async function getClientCredentialsToken() {
	try {
		console.log("Client credentials grant with new SDK");

		const accessToken = await spotifyClient.getAccessToken();

		return {
			accessToken,
		};
	} catch (error) {
		console.error("Error getting client credentials token:", error);
		if (error instanceof Error) {
			console.error(`Error message: ${error.message}`);
			console.error(`Error stack: ${error.stack}`);
		}
		throw error;
	}
}

export async function ensureAccessToken() {
	try {
		console.log("Ensuring access token is valid...");
		const accessToken = await spotifyClient.getAccessToken();
		console.log;
		return accessToken;
	} catch (error) {
		console.error("Error ensuring access token:", error);
		if (error instanceof Error) {
			console.error(`Error message: ${error.message}`);
		}
		throw error;
	}
}
