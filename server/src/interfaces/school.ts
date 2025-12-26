export interface SchoolNode {
  cursor: string;
  id: string;
  name: string;
  city: string;
  state: string;
  country: string;
}

export type CanonicalSchool = {
  canonicalName: string;
  canonicalCountry: string;
  branches: {
    id: string;
    name: string;
    city: string;
    state: string;
    cursor: string;
  }[];
};
