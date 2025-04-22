//@ts-nocheck
import {
	git_changes_from_recent_commits,
	get_latest_commits,
	get_my_github_info,
} from "./actions";
import type { AntispaceAIRequest } from "@antispace/sdk";
import type manifest from "../manifest";
const { Octokit } = require("@octokit/rest");
import db from "../db/local";

export default async function aiActions(...args) {
	console.log("ARGS HERE: ", args);
	const { name, parameters, meta } = args[0];
	console.log("meta", JSON.stringify(meta));
	const userKey = `${meta?.user?.id}:octokitID`;
	const octokey = await db.get(userKey);
	let octokit = null;

	octokit = await new Octokit({
		auth: octokey,
	});

	console.log("AI Action called:", name);
	console.log("Meta User ID:", meta?.user?.id);
	console.log("Parameters and metadata:", parameters, meta);
	console.log("octokey:", octokey);
	try {
		if (!octokey) {
			return {
				success: false,
				message:
					"Github actions are not possible since the authentication key has been lost",
			};
		}
	} catch (e: any) {
		return {
			error: e.message || e.to,
		};
	}

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
