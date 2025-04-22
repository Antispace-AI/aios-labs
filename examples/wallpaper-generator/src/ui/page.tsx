import { components as Anti } from "@antispace/sdk"
import type { Context } from "hono"

/**
 * This mod doesn't render a page, so this is a no-op
 * Included in the code purely for reference
 */
export default async function pageUI(c: Context) {
  return c.text(
    (
      <Anti.Column>
        <Anti.Text type="heading1">Hello, world!</Anti.Text>
      </Anti.Column>
    ) as any,
  )
}
