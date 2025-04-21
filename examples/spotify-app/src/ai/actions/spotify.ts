import type { AntispaceMetadata } from "@antispace/sdk";
import type { SpotifyTrack } from "../../spotify-type";
import { spotifyClient } from "../../config";
import { isConfigured } from "../../auth";
import type { Track, RecommendationSeed } from "@spotify/web-api-ts-sdk";

async function ensureValidToken() {
	console.log("Ensuring valid Spotify token before API call...");
	if (!isConfigured()) {
		console.error("Spotify API not configured. Missing environment variables.");
		throw new Error(
			"Spotify API not configured. Please set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in your environment variables.",
		);
	}

	return true;
}

export async function getRecommendationsSearch(
	seedTracks?: string[],
	seedArtists?: string[],
	seedGenres?: string[],
	limit = 10,
): Promise<SpotifyTrack[]> {
	const hasSeeds =
		(seedTracks && seedTracks.length > 0) ||
		(seedArtists && seedArtists.length > 0) ||
		(seedGenres && seedGenres.length > 0);

	if (!hasSeeds) {
		return [];
	}

	try {
		const recommendationParams: {
			seed_tracks?: string[];
			seed_artists?: string[];
			seed_genres?: string[];
			limit: number;
		} = { limit };

		if (seedTracks && seedTracks.length > 0) {
			recommendationParams.seed_tracks = seedTracks;
		}
		if (seedArtists && seedArtists.length > 0) {
			recommendationParams.seed_artists = seedArtists;
		}
		if (seedGenres && seedGenres.length > 0) {
			recommendationParams.seed_genres = seedGenres;
		}

		const recommendations =
			await spotifyClient.recommendations.get(recommendationParams);

		if (!recommendations || !recommendations.tracks) {
			console.log(
				"Spotify API returned no recommendations for the given seeds.",
			);
			return [];
		}

		console.log(
			`Recommendations received: ${recommendations.tracks.length} tracks found. Mapping results...`,
		);

		return recommendations.tracks.map(
			(track: Track): SpotifyTrack => ({
				id: track.id,
				name: track.name,
				artists: track.artists.map((artist) => ({
					id: artist.id,
					name: artist.name,
				})),
				album: {
					name: track.album.name,
					images: track.album.images,
				},
				preview_url: track.preview_url,
				external_urls: track.external_urls,
			}),
		);
	} catch (error) {
		console.error("Detailed error in getRecommendationsSearch:", error);
		if (error instanceof Error) {
			console.error(`Error name: ${error.name}`);
			console.error(`Error message: ${error.message}`);
		}
		return [];
	}
}

export async function getRecommendations(
	trackId: string,
): Promise<SpotifyTrack[]> {
	try {
		console.log(`Starting recommendations for track ID: "${trackId}"`);
		if (!trackId) {
			console.log("Missing track ID for recommendations");
			return [];
		}

		// Get the track details
		console.log(`Fetching track details for ID: "${trackId}"`);
		let track;
		try {
			track = await spotifyClient.tracks.get(trackId);
			if (!track) {
				console.log(`Track not found for ID: "${trackId}"`);
				return [];
			}
			console.log(
				`Track found: ${track.name}, Popularity: ${track.popularity}`,
			);
		} catch (trackError) {
			console.error("Error fetching track:", trackError);
		}

		const recommendationParams: any = {
			seed_tracks: [trackId],
			limit: 8,
			market: "US",
		};

		if (track?.popularity) {
			recommendationParams.target_popularity = track.popularity;
		}

		console.log("Recommendation parameters:", recommendationParams);

		try {
			const recommendations =
				await spotifyClient.recommendations.get(recommendationParams);

			if (!recommendations?.tracks?.length) {
				console.log("No recommendations returned from Spotify API");
				return [];
			}

			return recommendations.tracks.map((track) => ({
				id: track.id,
				name: track.name,
				artists: track.artists.map((artist) => ({ name: artist.name })),
				album: {
					name: track.album.name,
					images: track.album.images,
				},
				preview_url: track.preview_url,
				external_urls: track.external_urls,
			}));
		} catch (recoError) {
			console.error("Error getting recommendations:", recoError);

			try {
				console.log("Retrying with minimal parameters...");
				const minimalParams = { seed_tracks: [trackId] };
				const fallbackRecommendations =
					await spotifyClient.recommendations.get(minimalParams);

				if (!fallbackRecommendations?.tracks?.length) {
					return [];
				}

				return fallbackRecommendations.tracks.map((track) => ({
					id: track.id,
					name: track.name,
					artists: track.artists.map((artist) => ({ name: artist.name })),
					album: {
						name: track.album.name,
						images: track.album.images,
					},
					preview_url: track.preview_url,
					external_urls: track.external_urls,
				}));
			} catch (fallbackError) {
				console.error("Even fallback recommendations failed:", fallbackError);

				// If recommendations still fail, try to get the artist's top tracks as a fallback
				if (track?.artists?.[0]?.id) {
					try {
						const artistId = track.artists[0].id;
						console.log(`Falling back to top tracks for artist: ${artistId}`);

						const artistTracks = await spotifyClient.artists.topTracks(
							artistId,
							"US",
						);

						// Filter out the original track
						const recommendations = artistTracks.tracks.filter(
							(t) => t.id !== trackId,
						);

						console.log(
							`Found ${recommendations.length} artist tracks as recommendations`,
						);

						return recommendations.map((track) => ({
							id: track.id,
							name: track.name,
							artists: track.artists.map((artist) => ({ name: artist.name })),
							album: {
								name: track.album.name,
								images: track.album.images,
							},
							preview_url: track.preview_url,
							external_urls: track.external_urls,
						}));
					} catch (artistError) {
						console.error("Artist top tracks fallback failed:", artistError);
					}
				}

				return [];
			}
		}
	} catch (error) {
		console.error("Error in getRecommendations:", error);
		if (error instanceof Error) {
			console.error(`Error name: ${error.name}`);
			console.error(`Error message: ${error.message}`);
		}
		return [];
	}
}

export async function searchSpotify(
	query: string,
	type: "track" | "album" | "artist" | "playlist" = "track",
): Promise<SpotifyTrack[]> {
	try {
		console.log(`Searching Spotify for: "${query}" (type: ${type})`);
		await ensureValidToken();

		const results = await spotifyClient.search(query, [type], undefined, 8);
		console.log(
			`Search results received: ${results.tracks?.items.length || 0} tracks found`,
		);

		// Only handle tracks for now
		if (type === "track" && results.tracks) {
			return results.tracks.items.map((track) => ({
				id: track.id,
				name: track.name,
				artists: track.artists.map((artist) => ({ name: artist.name })),
				album: {
					name: track.album.name,
					images: track.album.images,
				},
				preview_url: track.preview_url,
				external_urls: track.external_urls,
			}));
		}
		// TODO: handle album, artist, playlist results if needed
		return [];
	} catch (error) {
		console.error("Error searching Spotify:", error);
		if (error instanceof Error) {
			console.error(`Error message: ${error.message}`);
			console.error(`Error stack: ${error.stack}`);
		}
		return [];
	}
}
