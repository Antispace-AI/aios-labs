//@ts-nocheck
import {
	git_changes_from_recent_commits,
	get_latest_commits,
	get_my_github_info,
} from "./actions";
import type { AntispaceAIRequest } from "@antispace/sdk";
import type manifest from "../manifest";
const { Octokit } = require("@octokit/rest");

export default async function aiActions({
	name,
	parameters,
	meta,
}: AntispaceAIRequest<typeof manifest>) {
	const octokit = null;
	//  await new Octokit({
	// 	auth: "none",
	// });

	console.log("AI Action called:", name);
	console.log("Parameters and metadata:", parameters, meta);

	switch (name) {
		case "git_changes_from_recent_commits": {
			try {
				const results = await git_changes_from_recent_commits(
					octokit,
					parameters,
				);
				return { success: true, results };
			} catch (e: any) {
				return {
					error: e.message || e.to,
				};
			}
		}

		case "get_latest_commits": {
			try {
				const results = await get_latest_commits(octokit, parameters);
				return { success: true, results };
			} catch (e: any) {
				return {
					error: e.message || e.to,
				};
			}
		}

		case "get_my_github_info": {
			try {
				const results = await get_my_github_info(octokit, parameters);
				return { success: true, results };
			} catch (e: any) {
				return {
					error: e.message || e.to,
				};
			}
		}
		default: {
			break;
		}
	}
}
