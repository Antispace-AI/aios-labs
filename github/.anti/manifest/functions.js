"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_my_github_info = exports.get_latest_commits = exports.git_changes_from_recent_commits = void 0;
/**
 * Function to get changes from recent commits in a repository
 */
exports.git_changes_from_recent_commits = {
    type: "function",
    function: {
        name: "git_changes_from_recent_commits",
        description: "Get detailed changes from the most recent commits in a repository",
        parameters: {
            type: "object",
            properties: {
                owner: {
                    type: "string",
                    description: "The owner of the repository",
                },
                repo: {
                    type: "string",
                    description: "The name of the repository",
                },
                numberOfCommits: {
                    type: "number",
                    description: "Number of recent commits to analyze (default: 5)",
                },
            },
            required: ["owner", "repo"],
        },
    },
};
/**
 * Function to get the latest commits from a user's repositories
 */
exports.get_latest_commits = {
    type: "function",
    function: {
        name: "get_latest_commits",
        description: "Get latest commits from a user's repositories",
        parameters: {
            type: "object",
            properties: {
                username: {
                    type: "string",
                    description: "GitHub username to get commits for, these values are not required if not specified it will fetch my own username. do not present it to the function.",
                },
                repo: {
                    type: "string",
                    description: "GitHub repo to get commits for, these values are not required if not specified do not present it to the function.",
                },
                maxResults: {
                    type: "number",
                    description: "Maximum number of commits to return (default: 10), these values are not required if not specified do not present it to the function.",
                },
            },
            required: ["username"],
        },
    },
};
/**
 * Function to get authenticated user's GitHub information
 */
exports.get_my_github_info = {
    type: "function",
    function: {
        name: "get_my_github_info",
        description: "OAuth app tokens and personal access tokens (classic) need the user scope in order for the response to include private profile information.",
        parameters: {
            type: "object",
            properties: {},
            required: [],
        },
    },
};
