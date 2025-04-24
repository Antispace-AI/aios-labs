//@ts-nocheck
import { components as Anti, type AntispaceContext } from "@antispace/sdk"
import type { WikiAppUIActions } from "../../types"

/**
 * Main page UI component for the Wiki app
 * @param anti - Antispace Context object containing request details
 * @returns JSX markup string response
 */
export default async function pageUI(anti: AntispaceContext<WikiAppUIActions>) {
  const { action, values, meta } = anti

  return (
    <Anti.Column padding="medium">
      <Anti.Text type="heading1">Wikipedia Integration</Anti.Text>
      <Anti.Text type="dim">
        Search and browse Wikipedia content directly from Antispace.
      </Anti.Text>
      
      <Anti.Divider />
      
      <Anti.Text type="subheading">Functions</Anti.Text>
      <Anti.Text type="text">
        This Wikipedia integration provides access to the following functions:
      </Anti.Text>
      
      <Anti.List>
        <Anti.ListItem>
          <Anti.Text type="text">Search Wikipedia for articles</Anti.Text>
        </Anti.ListItem>
        <Anti.ListItem>
          <Anti.Text type="text">Get article summaries</Anti.Text>
        </Anti.ListItem>
        <Anti.ListItem>
          <Anti.Text type="text">View article sections</Anti.Text>
        </Anti.ListItem>
      </Anti.List>
      
      <Anti.Divider />
      
      <Anti.Text type="subheading">Example Usage</Anti.Text>
      <Anti.Code language="typescript">
        {`
// Search Wikipedia
const results = await ai.wiki_search({ query: "artificial intelligence" });

// Get article summary
const summary = await ai.wiki_get_article_summary({ title: "Neural network" });

// Get article sections
const sections = await ai.wiki_get_article_sections({ title: "Machine learning" });
        `}
      </Anti.Code>
    </Anti.Column>
  )
}
