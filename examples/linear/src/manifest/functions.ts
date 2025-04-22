import type { AntispaceAppFunction } from "@antispace/sdk"

/**
 * Function to set the user's nickname
 */
export const create_issue: AntispaceAppFunction<
  "create_issue",
  {
    title: string
  }
> = {
  type: "function",
  function: {
    name: "create_issue",
    description: "Create a new issue",
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "Title for the new issue",
        },
      },
      required: ["title"],
    },
  },
}

export const get_issues: AntispaceAppFunction<
  "get_issues",
  {
    nickname: string
  }
> = {
  type: "function",
  function: {
    name: "get_issues",
    description: "Get user's issues",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
}
