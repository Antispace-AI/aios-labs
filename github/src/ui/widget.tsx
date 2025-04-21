//@ts-nocheck
import { components as Anti, type AntispaceContext } from "@antispace/sdk";
import type { MyAppUIActions } from "../../types";
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
export default async function widgetUI(anti: AntispaceContext<MyAppUIActions>) {
	const { action, values, meta } = anti;
	// const items = await getMyRepos();

	// console.log("Items Here: ", items);
	return (
		<Anti.Column padding="medium">
			<Anti.Text type="heading1">Github</Anti.Text>
			<Anti.Column align="start" justify="start">
				<Anti.Text type="dim">
					{" "}
					/settings/developers &gt; <br />
					personal access tokens &gt; <br /> Tokens (classic){" "}
				</Anti.Text>
				<Anti.Input placeholder="" name="prompt" />
				<Anti.Button
					action="generate"
					text="generate"
					loadingText="Generating..."
				/>
				{/* <Anti.Row></Anti.Row> */}
				<Anti.Divider />
				<Anti.Text type="subheading">{JSON.stringify(meta.user)}</Anti.Text>
				{/* {items?.length > 0 &&
					items?.map((item) => (
						<Anti.Row key={item?.id} type="text" justify="space-between">
							<Anti.Row key={item?.id} type="text" justify="start">
								<Anti.Text type="text">{item?.name}</Anti.Text>
							</Anti.Row>
							<Anti.Text type="text">{item?.owner?.login}</Anti.Text>
						</Anti.Row>
					))} */}
			</Anti.Column>
		</Anti.Column>
	);
}
