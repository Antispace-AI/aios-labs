// @ts-nocheck
import type { AntispaceMetadata } from "@antispace/sdk";

export async function git_changes_from_recent_commits(octokit, params) {
	const { owner, repo, numberOfCommits = 5 } = params;
	// Get recent commits
	const { data: commits } = await octokit.repos.listCommits({
		owner,
		repo,
		per_page: numberOfCommits,
	});

	// For each commit, get the diff
	for (const commit of commits) {
		const sha = commit.sha;

		// Get the commit details including the diff
		const { data: commitData } = await octokit.repos.getCommit({
			owner,
			repo,
			ref: sha,
		});

		let result = "";
		result = `Commit: ${sha} by ${commit.commit.author.name} Message: ${commit.commit.message} Commit: ${sha} by ${commit.commit.author.name} Files changed:`;

		// Display diff information for each file
		for (const file of commitData.files) {
			result += `- ${file.filename} (${file.status})`;
			result += `  Changes: +${file.additions}, -${file.deletions}`;
			result += `  Patch: ${file.patch}`;
		}
		console.log("Result Here: ", result);
		return result;
	}
}

export async function get_latest_commits(octokit, params) {
	console.log(`Running get_latest_commits with params: ${params}`);
	// const { maxResults = 10 } = params; // Extract maxResults with default value

	try {
		// Get authenticated user
		const { data: userData } = await octokit.rest.users.getAuthenticated();
		const username = userData.login;
		console.log(`Authenticated as: ${username}`);

		// Get user's repositories
		const response = await octokit.request("GET /user/repos", {
			per_page: 5,
			sort: "updated",
		});

		console.log(`Found ${response.data.length} repositories`);

		let allCommits = [];

		// For each repo, get recent commits
		for (const repo of response.data) {
			try {
				console.log(`Fetching commits for repo: ${repo.name}`);
				const { data: commits } = await octokit.rest.repos.listCommits({
					owner: username,
					repo: repo.name,
					per_page: 5,
				});

				// Process commit data to extract relevant information
				const processedCommits = commits.map((commit) => ({
					repo: repo.name,
					sha: commit.sha,
					message: commit.commit.message,
					author: commit.commit.author.name,
					date: commit.commit.author.date,
					url: commit.html_url,
				}));

				allCommits = [...allCommits, ...processedCommits];
			} catch (repoError) {
				console.log(
					`Error fetching commits for ${repo.name}: ${repoError.message}`,
				);
				// Continue to next repo instead of failing the entire function
			}
		}

		// Sort all commits by date (newest first)
		allCommits.sort((a, b) => new Date(b.date) - new Date(a.date));

		// Return only the requested number of commits
		return allCommits;
	} catch (error) {
		console.error(`Error fetching data: ${error.message}`);
		throw error;
	}
}

export async function get_my_github_info(octokit, params) {
	try {
		console.log("Entered get_my_github_info!"); // This is the username
		// This gets info about the currently authenticated user
		const { data: userData } = await octokit.rest.users.getAuthenticated();
		// const userData = { username: "chingun" };
		console.log("Authenticated as: ", userData); // This is the username

		return userData;
	} catch (error) {
		console.error("Error fetching authenticated user:", error.message);
		throw error;
	}
}
