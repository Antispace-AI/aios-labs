import { components as Anti, type AntispaceContext } from "@antispace/sdk"
import type { LinearUIActions } from "../../types"

/**
 * Main mage UI component that handles user interactions and renders the page interface
 * @param anti - Antispace Context object containing request details
 * @returns JSX markup string response
 */
export default async function pageUI(anti: AntispaceContext<LinearUIActions>) {
  const { action, values, meta } = anti

  return (
    <Anti.Column>
      <Anti.Text type="heading1">Hello, Antispace!</Anti.Text>
    </Anti.Column>
  )
}
