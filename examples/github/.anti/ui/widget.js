"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = widgetUI;
const jsx_runtime_1 = require("hono/jsx/jsx-runtime");
//@ts-nocheck
const sdk_1 = require("@antispace/sdk");
// import { Octokit } from "octokit";
// const octokit = new Octokit({
// 	auth: "none",
// });
// // Get authenticated user's repositories
// async function getMyRepos() {
// 	const response = await octokit.request("GET /user/repos", {
// 		per_page: 10, // Max 100 per page
// 		sort: "updated", // Options: created, updated, pushed, full_name
// 	});
// 	console.log(`You have ${response.data.length} repositories`);
// 	console.log(response.data.map((repo) => repo.name));
// 	return response.data;
// }
// // Get authenticated user's repositories
// async function getRecentChanges() {
// 	const response = await octokit.request("GET /user/repos", {
// 		per_page: 100, // Max 100 per page
// 		sort: "updated", // Options: created, updated, pushed, full_name
// 	});
// 	console.log(`You have ${response.data.length} repositories`);
// 	console.log(response.data.map((repo) => repo.name));
// 	return response.data;
// }
// // Get notifications
// async function getNotifications() {
// 	const notifications = await octokit.request("GET /notifications", {
// 		all: false,
// 	});
// 	console.log(`You have ${notifications.data.length} notifications`);
// 	return notifications.data;
// }
/**
 * Main widget UI component that handles user interactions and renders the widget interface
 * @param anti - Antispace Context object containing request details
 * @returns JSX markup string response
 */
async function widgetUI(anti) {
    const { action, values, meta } = anti;
    // const items = await getMyRepos();
    // console.log("Items Here: ", items);
    return ((0, jsx_runtime_1.jsxs)(sdk_1.components.Column, { padding: "medium", children: [(0, jsx_runtime_1.jsx)(sdk_1.components.Text, { type: "heading1", children: "Github" }), (0, jsx_runtime_1.jsxs)(sdk_1.components.Column, { align: "start", justify: "start", children: [(0, jsx_runtime_1.jsxs)(sdk_1.components.Text, { type: "dim", children: [" ", "/settings/developers > ", (0, jsx_runtime_1.jsx)("br", {}), "personal access tokens > ", (0, jsx_runtime_1.jsx)("br", {}), " Tokens (classic)", " "] }), (0, jsx_runtime_1.jsx)(sdk_1.components.Input, { placeholder: "", name: "prompt" }), (0, jsx_runtime_1.jsx)(sdk_1.components.Button, { action: "generate", text: "generate", loadingText: "Generating..." }), (0, jsx_runtime_1.jsx)(sdk_1.components.Divider, {}), (0, jsx_runtime_1.jsx)(sdk_1.components.Text, { type: "subheading", children: JSON.stringify(meta.user) })] })] }));
}
