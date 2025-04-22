"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = aiActions;
//@ts-nocheck
const actions_1 = require("./actions");
const { Octokit } = require("@octokit/rest");
const local_1 = __importDefault(require("../db/local"));
async function aiActions(...args) {
    console.log("ARGS HERE: ", args);
    const { name, parameters, meta } = args[0];
    console.log("meta", JSON.stringify(meta));
    const userKey = `${meta?.user?.id}:octokitID`;
    const octokey = await local_1.default.get(userKey);
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
                message: "Github actions are not possible since the authentication key has been lost",
            };
        }
    }
    catch (e) {
        return {
            error: e.message || e.to,
        };
    }
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
