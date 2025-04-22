import type { AntispaceAIRequest } from "@antispace/sdk"
import type manifest from "../manifest"
import { getUser } from "../util"
import { createIssue, getIssues } from "../util/linear"

export default async function aiActions({ name, parameters, meta }: AntispaceAIRequest<typeof manifest>) {
  const userId = meta.user.id

  const user = await getUser(userId)

  switch (name) {
    case "create_issue": {
      try {
        const issue = await createIssue(user, parameters.title)

        return { success: true, issue }
      } catch (e: any) {
        return {
          error: e.message || e.toString(),
        }
      }
    }

    case "get_issues": {
      try {
        const issues = await getIssues(user)
        const issuesWithState = await Promise.all(
          issues.map(async (issue) => {
            const state = await issue.state
            return {
              ...issue,
              state: {
                name: state?.name,
                type: state?.type,
              },
            }
          }),
        )

        return { success: true, issues: issuesWithState }
      } catch (e: any) {
        return {
          error: e.message || e.toString(),
        }
      }
    }

    default: {
      return { error: "Unknown AI action" }
    }
  }
}
