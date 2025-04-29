//@ts-nocheck
import { components as Anti, type AntispaceContext } from "@antispace/sdk";
import { wiki_get_featured_article } from "../ai/actions";
import type { WikiAppUIActions } from "../../types";
import db from "../db/local";

/**
 * Main widget UI component that displays today's featured Wikipedia article
 * @param anti - Antispace Context object containing request details
 * @returns JSX markup string response
 */
export default async function widgetUI(
	anti: AntispaceContext<WikiAppUIActions>,
) {
	const { action, values, meta } = anti;

	// Call the AI function to get featured article
	const featuredArticleResponse = await wiki_get_featured_article({});

	// Check if the AI call was successful
	const isSuccess = featuredArticleResponse?.success === true;
	const featuredArticle = isSuccess ? featuredArticleResponse?.results : null;

	console.log("featuredArticleResponse?.results: ", featuredArticleResponse);

	return (
		<Anti.Column padding="medium">
			<Anti.Text type="heading1">Wikipedia</Anti.Text>
			<Anti.Text type="dim">
				Search and browse Wikipedia content directly from Antispace.
			</Anti.Text>

			{isSuccess ? (
				<>
					<Anti.Text type="heading2">
						{featuredArticle.title}{" "}
						<Anti.Link href={featuredArticle.url} text="here" />
					</Anti.Text>
					<Anti.Text type="text">{featuredArticle.extract}</Anti.Text>
				</>
			) : (
				<Anti.Text type="error">
					Failed to load today's featured article. Please try again later.
				</Anti.Text>
			)}
		</Anti.Column>
	);
}
