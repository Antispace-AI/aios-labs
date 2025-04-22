import type { User } from "../util"

const LINEAR_API_ENDPOINT = "https://api.linear.app/graphql"

interface GraphQLError {
  message: string;
  locations?: { line: number; column: number }[];
  path?: string[];
  extensions?: Record<string, any>;
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: GraphQLError[];
}

/**
 * Makes a request to the Linear GraphQL API using fetch.
 * @param accessToken - The user's Linear OAuth access token.
 * @param query - The GraphQL query or mutation string.
 * @param variables - An optional object containing variables for the query/mutation.
 * @returns The data part of the GraphQL response.
 * @throws Throws an error if the request fails or GraphQL returns errors.
 */
async function fetchLinearGraphQL<T>(
  accessToken: string,
  query: string,
  variables?: Record<string, any>,
): Promise<T> {
  if (!accessToken) {
    throw new Error("Missing Access Token for Linear API request");
  }

  const response = await fetch(LINEAR_API_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Linear API request failed: ${response.status} ${response.statusText}`,
    );
  }

  const result = (await response.json()) as GraphQLResponse<T>;

  if (result.errors && result.errors.length > 0) {
    const errorMessages = result.errors.map((err) => err.message).join("; ");
    console.error("Linear GraphQL Errors:", result.errors);
    throw new Error(`Linear GraphQL Error: ${errorMessages}`);
  }

  if (!result.data) {
    throw new Error("Linear API returned no data and no errors.");
  }

  return result.data;
}

interface LinearIssueNode {
  id: string;
  title: string;
  identifier: string;
  state: {
    id: string;
    name: string;
    color: string;
    type: string;
    position: number;
  };
  url: string;
}

interface GetIssuesResponse {
  viewer: {
    assignedIssues?: {
      nodes: LinearIssueNode[];
    };
    createdIssues?: {
      nodes: LinearIssueNode[];
    };
  };
}

interface GetViewerTeamsResponse {
  viewer: {
    teams: {
      nodes: {
        id: string;
        name: string;
      }[];
    };
  };
}


interface CreateIssuePayload {
  issueCreate: {
    success: boolean;
    issue?: LinearIssueNode;
  };
}

export async function getIssues(user: User): Promise<LinearIssueNode[]> {
  if (!user.accessToken) {
    throw new Error("Missing Access Token");
  }

  const fields = `
    nodes {
      id
      title
      identifier
      state {
        id
        name
        color
        type
        position
      }
      url
    }
  `;

  // Choose the query based on the user's filter preference
  let query: string;
  if (user.filter === "created") {
    query = `
      query GetCreatedIssues {
        viewer {
          createdIssues(first: 50) { ${/* Adjust pagination as needed */''}
            ${fields}
          }
        }
      }
    `;
  } else { // Default to assigned issues
    query = `
      query GetAssignedIssues {
        viewer {
          assignedIssues(first: 50) { ${/* Adjust pagination as needed */''}
            ${fields}
          }
        }
      }
    `;
  }

  const data = await fetchLinearGraphQL<GetIssuesResponse>(user.accessToken, query);

  // Extract nodes based on which query was run
  if (user.filter === "created") {
    return data.viewer.createdIssues?.nodes ?? [];
  } else {
    return data.viewer.assignedIssues?.nodes ?? [];
  }
}

export async function createIssue(user: User, title: string): Promise<LinearIssueNode> {
  if (!user.accessToken) {
    throw new Error("Missing Access Token");
  }

  const getTeamQuery = `
    query GetFirstTeamId {
      viewer {
        teams(first: 1) {
          nodes {
            id
          }
        }
      }
    }
  `;

  const teamData = await fetchLinearGraphQL<GetViewerTeamsResponse>(
    user.accessToken,
    getTeamQuery
  );

  const teamId = teamData.viewer?.teams?.nodes?.[0]?.id;

  if (!teamId) {
    throw new Error("Could not find a team for the user to create the issue in.");
  }

  const createIssueMutation = `
    mutation CreateLinearIssue($title: String!, $teamId: String!) {
      issueCreate(input: { title: $title, teamId: $teamId }) {
        success
        issue {
          id
          title
          identifier
          # Include other fields if needed upon creation
        }
      }
    }
  `;

  const variables = {
    title,
    teamId,
  };

  const createData = await fetchLinearGraphQL<CreateIssuePayload>(
    user.accessToken,
    createIssueMutation,
    variables,
  );

  if (!createData.issueCreate.success || !createData.issueCreate.issue) {
    console.error("Failed to create issue. Response:", createData);
    throw new Error("Failed to create Linear issue.");
  }

  return createData.issueCreate.issue;
}
