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
		<Anti.Column padding="medium" gap="medium">
			{/* Header Section */}
			<Anti.Column gap="small">
				<Anti.Text type="heading1">📚 Wikipedia</Anti.Text>
				<Anti.Text type="dim">
					Discover knowledge from the world's largest encyclopedia
				</Anti.Text>
			</Anti.Column>

			{/* Featured Article Section */}
			<Anti.Column gap="medium">
				<Anti.Text type="heading2">✨ Today's Featured Article</Anti.Text>
				
				{isSuccess ? (
					<Anti.Column gap="small">
						{/* Article Title - Make it clickable and prominent */}
						<Anti.Link 
							href={featuredArticle.url} 
							text={featuredArticle.title}
							style={{ fontSize: "1.2em", fontWeight: "bold", color: "#0066cc" }}
						/>
						
						{/* Article Extract */}
						<Anti.Text type="text" style={{ lineHeight: "1.5" }}>
							{featuredArticle.extract}
						</Anti.Text>
						
						{/* Call to Action */}
						<Anti.Text type="dim" style={{ fontSize: "0.9em" }}>
							🔗 Click the title above to read the full article on Wikipedia
						</Anti.Text>
					</Anti.Column>
				) : (
					<Anti.Column gap="small">
						<Anti.Text type="error">
							⚠️ Unable to load today's featured article
						</Anti.Text>
						<Anti.Text type="dim">
							Please check your internet connection and try again. You can also visit Wikipedia directly to explore articles.
						</Anti.Text>
					</Anti.Column>
				)}
			</Anti.Column>
		</Anti.Column>
	);
}
