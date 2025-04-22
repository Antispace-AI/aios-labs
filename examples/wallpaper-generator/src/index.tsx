/**
 * Main application entry point file
 *
 * Sets up routes and handlers for a Hono web application that provides
 * UI components and AI functionality through REST endpoints.
 */

import { Hono } from "hono"
import aiActions from "./ai"
import { manifest } from "./manifest"
import pageUI from "./ui/page"
import widgetUI from "./ui/widget"

const app = new Hono()

// Route handlers for UI components
app.post("/ui/widget", widgetUI) // Handles widget UI requests
app.post("/ui/page", pageUI) // Handles page UI requests
app.post("/action", aiActions) // Handles AI action requests

app.get("/manifest", (c) => c.json(manifest)) // Returns the application manifest

// Port for the server to listen on
const port = 6100

export default {
  fetch: app.fetch,
  port,
}
