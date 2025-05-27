import { components as Anti, type AntispaceContext } from "@antispace/sdk"
import type { MyAppUIActions } from "../../types"

/**
 * Main widget UI component that handles user interactions and renders the widget interface
 * @param anti - Antispace Context object containing request details
 * @returns JSX markup string response
 */
export default async function widgetUI(anti: AntispaceContext<MyAppUIActions>) {
  const { action, values, meta } = anti

  return (
    <Anti.Column align="center" justify="center">
      <Anti.Text align="center">
        ▼ {action === "run_echo" && values.textToEcho || "Antispace"}
      </Anti.Text>

      <Anti.Row justify="space-between">
        <Anti.Input name="textToEcho" placeholder="To echo or not to echo..." />
        <Anti.Button action="run_echo" text="Echo" />
      </Anti.Row>
    </Anti.Column>
  )
}