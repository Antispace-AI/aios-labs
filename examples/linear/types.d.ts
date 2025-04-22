export type LinearUIActions = {
  set_api_key: { apiKey: string }
  create_issue: { newIssueTitle: string }
  filter_issues: { filter: string }
}
