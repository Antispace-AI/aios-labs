//@ts-nocheck
import {
  wiki_search,
  wiki_get_article_summary,
  wiki_get_article_sections,
  wiki_get_featured_article
} from "./actions/index";
import type { AntispaceAIRequest } from "@antispace/sdk";
import db from "../db/local";

// We delegate all parameter handling to the action functions for robustness

export default async function aiActions(...args) {
  const { name, parameters: rawParameters, meta } = args[0];
  
  // Log everything we receive for debugging
  console.log("AI Action called:", name);
  console.log("Raw parameters (typeof):", typeof rawParameters);
  console.log("Raw parameters:", JSON.stringify(rawParameters));
  console.log("Metadata:", meta);

  try {
    switch (name) {
      case "wiki_search": {
        console.log("Calling wiki_search with raw parameters:", JSON.stringify(rawParameters));
        const results = await wiki_search(rawParameters, db, meta);
        
        // Check if there was an error
        if (results && results.error) {
          return { 
            success: false,
            message: results.message || "Failed to search Wikipedia"
          };
        }
        
        return { success: true, results };
      }

      case "wiki_get_article_summary": {
        console.log("Calling wiki_get_article_summary with raw parameters:", JSON.stringify(rawParameters));
        const results = await wiki_get_article_summary(rawParameters);
        
        // Check if there was an error
        if (results && results.error) {
          return { 
            success: false,
            message: results.message || "Failed to get article summary"
          };
        }
        
        return { success: true, results };
      }

      case "wiki_get_article_sections": {
        console.log("Calling wiki_get_article_sections with raw parameters:", JSON.stringify(rawParameters));
        const results = await wiki_get_article_sections(rawParameters);
        
        // Check if there was an error
        if (results && results.error) {
          return { 
            success: false,
            message: results.message || "Failed to get article sections"
          };
        }
        
        return { success: true, results };
      }

      case "wiki_get_featured_article": {
        console.log("Calling wiki_get_featured_article");
        const results = await wiki_get_featured_article();
        
        // Check if there was an error
        if (results && results.error) {
          return { 
            success: false,
            message: results.message || "Failed to get featured article"
          };
        }
        
        return { success: true, results };
      }

      default: {
        return {
          success: false,
          message: `Unknown function: ${name}`
        };
      }
    }
  } catch (e) {
    console.error(`Error in Wiki AI action ${name}:`, e);
    return {
      success: false,
      error: true,
      message: e instanceof Error ? e.message : String(e)
    };
  }
}
