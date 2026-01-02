export interface SchoolSearchValidAPIResponse {
  schools: {
    canonicalName: string;
    canonicalCountry: string;
    branches: {
      id: string;
      cursor: string;
      name: string;
      city: string;
      state: string;
    }[];
  }[];
}

export interface SchoolDetailsValidAPIResponse {
  professors: {
    id: string;
    cursor: string;
    firstName: string;
    lastName: string;
    department: string;
    numRatings: number;
    avgRatingRounded: number;
  }[];
}
