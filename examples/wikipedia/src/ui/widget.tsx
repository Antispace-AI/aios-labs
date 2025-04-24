//@ts-nocheck
import { components as Anti, type AntispaceContext } from "@antispace/sdk"
import type { WikiAppUIActions } from "../../types"
import db from "../db/local"

/**
 * Main widget UI component that displays today's featured Wikipedia article
 * @param anti - Antispace Context object containing request details
 * @returns JSX markup string response
 */
export default async function widgetUI(anti: AntispaceContext<WikiAppUIActions>) {
  const { action, values, meta } = anti
  
  // Call the AI function to get featured article
  const featuredArticleResponse = await anti.ai.wiki_get_featured_article({});
  
  // Check if the AI call was successful
  const isSuccess = featuredArticleResponse?.success === true;
  const featuredArticle = isSuccess ? featuredArticleResponse.results : null;
  
  return (
    <Anti.Column padding="medium">
      <Anti.Text type="heading1">Wikipediaaaa</Anti.Text>
      <Anti.Text type="dim">Search and browse Wikipedia content directly from Antispace.</Anti.Text>
      
      {isSuccess ? (
        <>
          <Anti.Text type="subheading">Today's Featured Article</Anti.Text>
          
          <Anti.Text type="heading2">{featuredArticle.title}</Anti.Text>
          
          <Anti.Text type="text">
            {featuredArticle.extract}
          </Anti.Text>
          
          <Anti.Text type="dim">
            Read the full article at: {featuredArticle.url}
          </Anti.Text>
        </>
      ) : (
        <Anti.Text type="error">
          Failed to load today's featured article. Please try again later.
        </Anti.Text>
      )}
    </Anti.Column>
  )
}
