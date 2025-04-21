import { components as Anti, type AntispaceContext } from "@antispace/sdk";
import type { MyAppUIActions } from "../../types";

/**
 * Main mage UI component that handles user interactions and renders the page interface
 * @param anti - Antispace Context object containing request details
 * @returns JSX markup string response
 */
export default async function pageUI(anti: AntispaceContext<MyAppUIActions>) {
	const { action, values, meta } = anti;

	console.log({ action, values, meta });

	return (
		<Anti.Column>
			<Anti.Text type="heading1">Hello, Antispace! - FROM RICKY</Anti.Text>
		</Anti.Column>
	);
}
