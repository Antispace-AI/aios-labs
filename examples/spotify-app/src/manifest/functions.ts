import type { AntispaceAppFunction } from "@antispace/sdk";

/**
 * Function to set the user's nickname
 */
export const set_nickname: AntispaceAppFunction<
	"set_nickname",
	{
		nickname: string;
	}
> = {
	type: "function",
	function: {
		name: "set_nickname",
		description: "Set user's nickname",
		parameters: {
			type: "object",
			properties: {
				nickname: {
					type: "string",
					description: "Nickname string",
				},
			},
			required: ["nickname"],
		},
	},
};

export const say_nickname: AntispaceAppFunction<"say_nickname"> = {
	type: "function",
	function: {
		name: "say_nickname",
		description: "Echo back the user's nickname",
		parameters: {
			type: "object",
			properties: {},
			required: [],
		},
	},
};

export const search_spotify: AntispaceAppFunction<
	"search_spotify",
	{
		query: string;
		type?: "track" | "album" | "artist" | "playlist";
	}
> = {
	type: "function",
	function: {
		name: "search_spotify",
		description:
			"Search for music on Spotify by track, album, artist, or playlist",
		parameters: {
			type: "object",
			properties: {
				query: {
					type: "string",
					description:
						"What you want to search for on Spotify (e.g., 'Daft Punk', 'Bohemian Rhapsody')",
				},
				type: {
					type: "string",
					description:
						"The type of content to search for: track, album, artist, or playlist (defaults to track if not specified)",
				},
			},
			required: ["query"],
		},
	},
};

export const get_recommendations: AntispaceAppFunction<
	"get_recommendations",
	{
		trackId: string;
	}
> = {
	type: "function",
	function: {
		name: "get_recommendations",
		description: "Find similar songs based on a track you like",
		parameters: {
			type: "object",
			properties: {
				trackId: {
					type: "string",
					description:
						"Spotify track ID to use as a reference for finding similar music",
				},
			},
			required: ["trackId"],
		},
	},
};

export const recommendations_search: AntispaceAppFunction<
	"recommendations_search",
	{
		seedTracks?: string;
		seedArtists?: string;
		seedGenres?: string;
	}
> = {
	type: "function",
	function: {
		name: "recommendations_search",
		description:
			"Get music recommendations based on seed tracks, artists, and genres",
		parameters: {
			type: "object",
			properties: {
				seedTracks: {
					type: "string",
					description: "Comma-separated list of Spotify track IDs",
				},
				seedArtists: {
					type: "string",
					description: "Comma-separated list of Spotify artist IDs",
				},
				seedGenres: {
					type: "string",
					description: "Comma-separated list of genre names",
				},
			},
			required: [],
		},
	},
};
