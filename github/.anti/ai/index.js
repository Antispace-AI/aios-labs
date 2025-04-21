"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = aiActions;
//@ts-nocheck
const actions_1 = require("./actions");
const { Octokit } = require("@octokit/rest");
async function aiActions({ name, parameters, meta, }) {
    const octokit = null;
    //  await new Octokit({
    // 	auth: "none",
    // });
    console.log("AI Action called:", name);
    console.log("Parameters and metadata:", parameters, meta);
    switch (name) {
        case "git_changes_from_recent_commits": {
            try {
                const results = await (0, actions_1.git_changes_from_recent_commits)(octokit, parameters);
                return { success: true, results };
            }
            catch (e) {
                return {
                    error: e.message || e.to,
                };
            }
        }
        case "get_latest_commits": {
            try {
                const results = await (0, actions_1.get_latest_commits)(octokit, parameters);
                return { success: true, results };
            }
            catch (e) {
                return {
                    error: e.message || e.to,
                };
            }
        }
        case "get_my_github_info": {
            try {
                const results = await (0, actions_1.get_my_github_info)(octokit, parameters);
                return { success: true, results };
            }
            catch (e) {
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
