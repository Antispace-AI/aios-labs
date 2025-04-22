import { components as Anti, type AntispaceContext } from "@antispace/sdk"
import type { LinearUIActions } from "../../types"
import { getUser } from "../util"
import { createIssue, getIssues } from "../util/linear"
import { getStatusIcon, type StatusIcon } from "../util/getIssueIcon"
import db from "../util/db"

/**
 * Main widget UI component that handles user interactions and renders the widget interface
 * @param anti - Antispace Context object containing request details
 * @returns JSX markup string response
 */
export default async function widgetUI(anti: AntispaceContext<LinearUIActions>) {
  const { action, values, meta } = anti

  const userId = meta.user.id

  const user = await getUser(userId)

  switch (action) {
    case "create_issue": {
      const { newIssueTitle } = values
      await createIssue(user, newIssueTitle)
      break
    }
    case "filter_issues": {
      const { filter } = values
      await db.from("users").update({ filter }).eq("id", user.id)
      break
    }
  }

  if (!user?.accessToken) {
    return (
      <Anti.Column align="center">
        <Anti.Image src="https://storage.anti.space/linear.jpeg" width={42} height={42} rounded />
        <Anti.Text type="heading1">Linear</Anti.Text>
        <Anti.Text type="dim">Authenticate with Linear to get started</Anti.Text>
        <Anti.Column align="center">
          <Anti.Button action={`antispace:open_external_url:http://localhost:6100/authenticate-linear?userId=${user.id}`} text="Connect Linear" type="primary" />
          <Anti.Button action="_check" text="Refresh" type="secondary" />
        </Anti.Column>
      </Anti.Column>
    )
  }

  const issues = await getIssues(user)
  const issuesWithState = await Promise.all(
    issues.map(async (issue) => {
      const state = await issue.state
      return { ...issue, state }
    }),
  )

  return (
    <Anti.Column spacing="medium">
      <Anti.Row width="full">
        <Anti.Input placeholder="Create New Issue" name="newIssueTitle" width="full" />
        <Anti.Button action="create_issue" text="Create" />
      </Anti.Row>

      <Anti.Column spacing="small">
        <Anti.Row align="center" justify="space-between">
          <Anti.Text type="heading2">My Issues</Anti.Text>
          <Anti.Select name="filter" action="filter_issues" value={user.filter || "assigned"}>
            <Anti.SelectOption value="created" label="Created" />
            <Anti.SelectOption value="assigned" label="Assigned" />
          </Anti.Select>
        </Anti.Row>
        <Anti.Column spacing="small">
          {issuesWithState
            .sort((a, b) => (a.state?.position || 0) - (b.state?.position || 0))
            .map((issue) => {
              let icon: StatusIcon | null = null
              if (issue.state) {
                icon = getStatusIcon(issue.state)
              }
              return (
                <Anti.Row width="full" align="center" clickAction={`antispace:open_external_url:${issue.url}`} key={issue.id}>
                  {icon && <Anti.Image src={`https://images.anti.space/linear/${icon.source}`} width={16} height={16} tint={icon.tintColor} alt={issue.state?.name} />}
                  <Anti.Row padding="small" width="full" justify="space-between">
                    <Anti.Text type="body">{issue.title}</Anti.Text>
                    <Anti.Text type="caption">{issue.identifier}</Anti.Text>
                  </Anti.Row>
                </Anti.Row>
              )
            })}
        </Anti.Column>
      </Anti.Column>
    </Anti.Column>
  )
}
