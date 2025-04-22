//@ts-nocheck
import { components as Anti, type AntispaceContext } from "@antispace/sdk";
import type { MyAppUIActions } from "../../types";
import { Octokit } from "@octokit/rest";
import db from "../db/local";

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
export default async function widgetUI(anti: AntispaceContext<MyAppUIActions>) {
	const { action, values, meta } = anti;

	// Create the key for this user
	const userKey = `${meta?.user?.id}:octokitID`;
	const octokey = await db.get(userKey);
	// Try to get an Octokit instance (will be null if not authenticated)
	let repos = [];
	let octokit = null;
	// If authenticated, fetch repositories
	if (octokey) {
		try {
			octokit = await new Octokit({
				auth: octokey,
			});
			const response = await octokit.repos.listForAuthenticatedUser();
			repos = response.data;
		} catch (error) {
			console.error("Error fetching repositories:", error);
		}
	}
	switch (action) {
		case "enter_key": {
			// Fetch repositories with the new token
			try {
				octokit = await new Octokit({
					auth: values.auth_key,
				});
				const octos = db.set(userKey, values.auth_key);
				const response = await octokit.repos.listForAuthenticatedUser();
				repos = response.data;
			} catch (error) {
				console.error("Error fetching repositories with new token:", error);
			}
			break;
		}
		default: {
			// Handle individual generation deletion
			if (action?.startsWith("delete_generation:")) {
				const id = action?.split(":")[1];
				await db.delete(generations).where(eq(generations.id, id));
			}
			break;
		}
	}

	return (
		<Anti.Column padding="medium">
			<Anti.Text type="heading1">Github</Anti.Text>
			<Anti.Text type="dim">
				{" "}
				/settings/developers &gt; personal access tokens &gt; <br /> Tokens
				(classic){" "}
			</Anti.Text>

			{!octokit ? (
				<>
					<Anti.Input placeholder="Enter your GitHub token" name="auth_key" />
					<Anti.Button
						action="enter_key"
						text="Connect GitHub"
						loadingText="Connecting..."
					/>
				</>
			) : (
				<>
					<Anti.Text type="subheading">Connected to GitHub</Anti.Text>
					<Anti.Button
						action="disconnect"
						text="Disconnect"
						variant="secondary"
					/>

					<Anti.Divider />

					<Anti.Text type="subheading">Your Repositories</Anti.Text>
					{repos.length > 0 ? (
						repos.map((repo) => (
							<Anti.Row key={repo.id} type="text" justify="space-between">
								<Anti.Row type="text" justify="start">
									<Anti.Text type="text">{repo.name}</Anti.Text>
								</Anti.Row>
								<Anti.Text type="text">{repo.owner.login}</Anti.Text>
							</Anti.Row>
						))
					) : (
						<Anti.Text type="dim">No repositories found</Anti.Text>
					)}
				</>
			)}
		</Anti.Column>
	);
}
