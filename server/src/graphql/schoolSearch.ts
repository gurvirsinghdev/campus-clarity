import { gql } from "graphql-request";
import type { SchoolNode } from "../interfaces/school";

export const schoolSearchQuery = gql`
  query SchoolSearch($query: SchoolSearchQuery) {
    newSearch {
      schools(query: $query) {
        edges {
          cursor
          node {
            id
            name
            city
            state
            country
          }
        }
        pageInfo {
          endCursor
          hasNextPage
        }
      }
    }
  }
`;

export interface SchoolSearchQueryValidResponse {
  newSearch: {
    schools: {
      edges: {
        cursor: string;
        node: SchoolNode;
      }[];
      pageInfo: {
        endCursor: string;
        hasNextPage: boolean;
      };
    };
  };
}
