"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = widgetUI;
const jsx_runtime_1 = require("hono/jsx/jsx-runtime");
//@ts-nocheck
const sdk_1 = require("@antispace/sdk");
const rest_1 = require("@octokit/rest");
const local_1 = __importDefault(require("../db/local"));
// // // Get authenticated user's repositories
// async function authenticateGithub(meta) {
// 	// Create a Redis-backed state for this user's Octokit instance
// 	const [getOctokit, setOctokit, resetOctokit] = useRedis(
// 		`${meta?.user?.id}:octokitID`,
// 	);
// 	// Try to get cached Octokit instance
// 	let octokit = await getOctokit();
// 	if (!octokit) {
// 		console.log("Creating new Octokit instance");
// 		// Create new Octokit instance
// 		octokit = new Octokit({
// 			auth: meta.user.githubToken,
// 		});
// 		// Cache it for future use (expires in 1 hour)
// 		await setOctokit(octokit, 3600);
// 	} else {
// 		console.log("Using cached Octokit instance");
// 	}
// 	return octokit;
// }
async function getMyRepos(octokit) {
    const response = await octokit.request("GET /user/repos", {
        per_page: 10, // Max 100 per page
        sort: "updated", // Options: created, updated, pushed, full_name
    });
    console.log(`You have ${response.data.length} repositories`);
    console.log(response.data.map((repo) => repo.name));
    return response.data;
}
// // Get authenticated user's repositories
async function getRecentChanges(octokit) {
    const response = await octokit.request("GET /user/repos", {
        per_page: 100, // Max 100 per page
        sort: "updated", // Options: created, updated, pushed, full_name
    });
    console.log(`You have ${response.data.length} repositories`);
    console.log(response.data.map((repo) => repo.name));
    return response.data;
}
/**
 * Main widget UI component that handles user interactions and renders the widget interface
 * @param anti - Antispace Context object containing request details
 * @returns JSX markup string response
 */
async function widgetUI(anti) {
    const { action, values, meta } = anti;
    // Create the key for this user
    const userKey = `${meta?.user?.id}:octokitID`;
    const octokey = await local_1.default.get(userKey);
    // Try to get an Octokit instance (will be null if not authenticated)
    let repos = [];
    let octokit = null;
    // If authenticated, fetch repositories
    if (octokey) {
        try {
            octokit = await new rest_1.Octokit({
                auth: octokey,
            });
            const response = await octokit.repos.listForAuthenticatedUser();
            repos = response.data;
        }
        catch (error) {
            console.error("Error fetching repositories:", error);
        }
    }
    switch (action) {
        case "enter_key": {
            // Fetch repositories with the new token
            try {
                octokit = await new rest_1.Octokit({
                    auth: values.auth_key,
                });
                const octos = local_1.default.set(userKey, values.auth_key);
                const response = await octokit.repos.listForAuthenticatedUser();
                repos = response.data;
            }
            catch (error) {
                console.error("Error fetching repositories with new token:", error);
            }
            break;
        }
        default: {
            // Handle individual generation deletion
            if (action?.startsWith("delete_generation:")) {
                const id = action?.split(":")[1];
                await local_1.default.delete(generations).where(eq(generations.id, id));
            }
            break;
        }
    }
    return ((0, jsx_runtime_1.jsxs)(sdk_1.components.Column, { padding: "medium", children: [(0, jsx_runtime_1.jsx)(sdk_1.components.Text, { type: "heading1", children: "Github" }), (0, jsx_runtime_1.jsxs)(sdk_1.components.Text, { type: "dim", children: [" ", "/settings/developers > personal access tokens > ", (0, jsx_runtime_1.jsx)("br", {}), " Tokens (classic)", " "] }), !octokit ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(sdk_1.components.Input, { placeholder: "Enter your GitHub token", name: "auth_key" }), (0, jsx_runtime_1.jsx)(sdk_1.components.Button, { action: "enter_key", text: "Connect GitHub", loadingText: "Connecting..." })] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(sdk_1.components.Text, { type: "subheading", children: "Connected to GitHub" }), (0, jsx_runtime_1.jsx)(sdk_1.components.Button, { action: "disconnect", text: "Disconnect", variant: "secondary" }), (0, jsx_runtime_1.jsx)(sdk_1.components.Divider, {}), (0, jsx_runtime_1.jsx)(sdk_1.components.Text, { type: "subheading", children: "Your Repositories" }), repos.length > 0 ? (repos.map((repo) => ((0, jsx_runtime_1.jsxs)(sdk_1.components.Row, { type: "text", justify: "space-between", children: [(0, jsx_runtime_1.jsx)(sdk_1.components.Row, { type: "text", justify: "start", children: (0, jsx_runtime_1.jsx)(sdk_1.components.Text, { type: "text", children: repo.name }) }), (0, jsx_runtime_1.jsx)(sdk_1.components.Text, { type: "text", children: repo.owner.login })] }, repo.id)))) : ((0, jsx_runtime_1.jsx)(sdk_1.components.Text, { type: "dim", children: "No repositories found" }))] }))] }));
}
