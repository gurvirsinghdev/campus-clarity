export const professorsListingQuery = `
query SchoolTeachers($schoolId: ID!) {
  newSearch {
    teachers(query: { schoolID: $schoolId, text: "" }) {
      edges {
        cursor
        node {
          id
          firstName
          lastName
          avgRatingRounded
          numRatings
          department 
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
}
`;

export interface ProfessorsListingQueryValidResponse {
  newSearch: {
    teachers: {
      edges: {
        cursor: string;
        node: {
          id: string;
          firstName: string;
          lastName: string;
          avgRatingRounded: number;
          numRatings: number;
          department: string;
        };
      }[];
      pageInfo: {
        hasNextPage: boolean;
        endCursor: string;
      };
    };
  };
}
