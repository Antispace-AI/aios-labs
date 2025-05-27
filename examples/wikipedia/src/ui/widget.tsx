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

  const featuredArticleResponse = await wiki_get_featured_article();
  const isSuccess = featuredArticleResponse?.success === true;
  const featuredArticle = isSuccess ? featuredArticleResponse?.results : null;

  return (
    <Anti.Column width="full" spacing="medium">
      <Anti.Row padding="medium" width="full" align="center">
        <Anti.Column spacing="small" width="full">
          <Anti.Text type="heading1" weight="bold">Wikipedia</Anti.Text>
          <Anti.Text type="dim">The world's largest encyclopedia</Anti.Text>
        </Anti.Column>
        <Anti.Badge text="Featured" type="accent" />
      </Anti.Row>
      <Anti.Column type="border" padding="medium" spacing="medium" width="full">
        <Anti.Row justify="space-between" align="center" width="full">
          <Anti.Text type="heading2" weight="semibold">Today's Featured Article</Anti.Text>
          <Anti.Badge text="New" type="primary" />
        </Anti.Row>
        
        {isSuccess ? (
          <Anti.Column spacing="medium" width="full">
            <Anti.Text type="heading3" weight="bold">
              {featuredArticle?.title || "Article Title"}
            </Anti.Text>
            
            <Anti.Column type="border" padding="medium" width="full">
              <Anti.Text type="body">
                {featuredArticle?.extract || "Article content unavailable."}
              </Anti.Text>
            </Anti.Column>
            
            <Anti.Row justify="space-between" align="center" width="full">
              <Anti.Text type="small">Source: Wikipedia</Anti.Text>
              <Anti.Row spacing="small">
                <Anti.Button 
                  action="save_article" 
                  text="Save" 
                  type="secondary" 
                  size="small" 
                />
                <Anti.Button 
                  action="open_article" 
                  text="Read Full Article" 
                  type="primary" 
                  size="small"
                />
              </Anti.Row>
            </Anti.Row>
          </Anti.Column>
        ) : (
          <Anti.Column spacing="medium" width="full" align="center" padding="large">
            <Anti.Text type="negative" weight="semibold">
              Unable to load today's featured article
            </Anti.Text>
            <Anti.Text type="dim" align="center">
              Please check your internet connection and try again.
            </Anti.Text>
            <Anti.Button 
              action="retry_load" 
              text="Retry" 
              type="accent" 
              size="medium"
            />
          </Anti.Column>
        )}
      </Anti.Column>
      <Anti.Row type="border" padding="medium" width="full" justify="space-between">
        <Anti.Text type="subheading" weight="medium">Quick Links</Anti.Text>
        <Anti.Row spacing="medium">
          <Anti.Link href="https://en.wikipedia.org/wiki/Main_Page" text="Home" />
          <Anti.Link href="https://en.wikipedia.org/wiki/Wikipedia:Contents" text="Contents" />
          <Anti.Link href="https://en.wikipedia.org/wiki/Portal:Current_events" text="Current Events" />
        </Anti.Row>
      </Anti.Row>
      <Anti.Column width="full" spacing="small">
        <Anti.Divider type="horizontal" />
        <Anti.Row padding="small" justify="space-between" align="center" width="full">
          <Anti.Text type="small">Updated daily at midnight UTC</Anti.Text>
          <Anti.Badge text="Wikipedia API" type="secondary" />
        </Anti.Row>
      </Anti.Column>
    </Anti.Column>
  );
}
