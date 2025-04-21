import type { AntispaceAIRequest } from "@antispace/sdk";
import type manifest from "../manifest";
import * as actions from "./actions";

export default async function aiActions({
	name,
	parameters,
	meta,
}: AntispaceAIRequest<typeof manifest>) {
	console.log("AI Action called:", name);
	console.log("Parameters and metadata:", parameters, meta);

	switch (name) {
		case "search_spotify": {
			const { query, type } = parameters;
			try {
				const results = await actions.searchSpotify(query, type);
				return {
					success: true,
					results,
				};
			} catch (e: unknown) {
				return {
					error: e instanceof Error ? e.message : String(e) || "Unknown error",
				};
			}
		}

		case "get_recommendations": {
			const { trackId } = parameters;
			try {
				const results = await actions.getRecommendations(trackId);
				return {
					success: true,
					results,
				};
			} catch (e: unknown) {
				return {
					error: e instanceof Error ? e.message : String(e) || "Unknown error",
				};
			}
		}

		case "set_nickname": {
			const { nickname } = parameters;
			// Minimal implementation: just echo back
			return { success: true, nickname };
		}

		case "say_nickname": {
			// Minimal implementation: just echo a static message
			return { success: true, message: "Nickname feature not implemented." };
		}

		default: {
			break;
		}
	}
}
