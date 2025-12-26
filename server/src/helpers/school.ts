import jaroWinkler from "jaro-winkler";
import type { CanonicalSchool, SchoolNode } from "../interfaces/school";

type CleanSchoolNode = Omit<SchoolNode, "country"> & {
  country: SchoolNode["country"] | null;
};

export const cleanSchool = (schoolNode: SchoolNode): CleanSchoolNode => {
  return {
    ...schoolNode,
    name: cleanSchoolName(schoolNode.name),
    city: schoolNode.city?.trim(),
    state: schoolNode.state?.trim(),
    country: cleanSchoolCountry(schoolNode.country),
  };
};

export const cleanSchoolName = (schoolName: SchoolNode["name"]) => {
  if (!schoolName) return schoolName;

  /** Fixing the spacing and capitalization of the school name */
  let cleanedSchoolName = schoolName
    .replace(/^The/gm, "")
    .trim()
    .split(" ")
    .map((word) =>
      word.length > 0
        ? word[0]?.toUpperCase() + word.slice(1).toLowerCase()
        : word
    )
    .join(" ");

  return cleanedSchoolName;
};

export const cleanSchoolCountry = (schoolCountry: SchoolNode["country"]) => {
  if (!schoolCountry) return null;

  /** Spliting the legacy field into parts.*/
  const parts = schoolCountry.split("-");
  if (parts.length >= 2) {
    return parts[1] as string;
  }

  return null;
};

export const dedupeSchools = <T extends SchoolNode | CleanSchoolNode>(
  schools: T[]
): T[] => {
  const map = new Map<string, T>();

  for (const school of schools) {
    const schoolKey = `${school.name}-${school.city}-${school.state}`;
    if (!map.has(schoolKey)) {
      map.set(schoolKey, school);
    }
  }

  return Array.from(map.values());
};

const STOPWORDS = new Set([
  "university",
  "college",
  "institute",
  "of",
  "the",
  "at",
  "for",
]);

export const normalizeSchoolNameForSimilarityCheck = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((word) => !STOPWORDS.has(word))
    .join(" ")
    .trim();
};

const tokenSimilarity = (a: string, b: string) => {
  const A = new Set(a.split(" "));
  const B = new Set(b.split(" "));
  const intersection = [...A].filter((x) => B.has(x)).length;
  return intersection / Math.min(A.size, B.size);
};

export const groupSchools = (schools: CleanSchoolNode[]) => {
  const parent = schools.map((_, i) => i);

  const find = (x: number): number =>
    parent[x] === x ? x : (parent[x] = find(parent[x]!));

  const union = (a: number, b: number) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent[rb] = ra;
  };

  for (let i = 0; i < schools.length; i++) {
    for (let j = i + 1; j < schools.length; j++) {
      const a = normalizeSchoolNameForSimilarityCheck(schools[i]!.name);
      const b = normalizeSchoolNameForSimilarityCheck(schools[j]!.name);

      const jw = jaroWinkler(a, b);
      const token = tokenSimilarity(a, b);

      if (jw > 0.9 && token > 0.7) {
        union(i, j);
      }
    }
  }

  const groups = new Map<number, CleanSchoolNode[]>();

  schools.forEach((school, i) => {
    const root = find(i);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root)!.push(school);
  });

  return [...groups.values()];
};

export const createCanonicalSchools = (
  group: CleanSchoolNode[][]
): CanonicalSchool[] => {
  const canonicalSchools: CanonicalSchool[] = [];

  for (const schools of group) {
    canonicalSchools.push({
      canonicalName: getCanonicalName(schools)!,
      canonicalCountry: inferCountryForGroup(schools)!,
      branches: schools.map((school) => ({
        id: school.id,
        name: school.name,
        city: school.city,
        state: school.state,
        cursor: school.cursor,
      })),
    });
  }

  return canonicalSchools;
};

export const getCanonicalName = (schools: CleanSchoolNode[]) => {
  if (!Array.isArray(schools) || schools.length === 0) return null;

  const names = schools
    .map((s) => s.name?.trim())
    .filter(Boolean)
    .map((name) =>
      name
        .toLowerCase()
        .replace(/[^a-z\s]/g, "")
        .split(/\s+/)
    );

  if (names.length === 0) return null;

  const base = names.reduce((a, b) => (a.length <= b.length ? a : b));
  let best: string[] = [];

  for (let start = 0; start < base.length; start++) {
    for (let end = start + 1; end <= base.length; end++) {
      const phrase = base.slice(start, end).join(" ");

      const existsInAll = names.every((tokens) =>
        tokens.join(" ").includes(phrase)
      );

      if (existsInAll && end - start > best.length) {
        best = base.slice(start, end);
      }
    }
  }

  if (!best.length) return null;

  return best.map((w) => w[0]!.toUpperCase() + w.slice(1)).join(" ");
};

export const inferCountryForGroup = (schools: CleanSchoolNode[]) => {
  const map = new Map<string, number>();
  for (const school of schools) {
    map.set(school.country!, (map.get(school.country!) || 0) + 1);
  }

  let maxCountry: string | undefined;
  let maxCount = 0;

  for (const [country, count] of map.entries()) {
    if (count > maxCount) {
      maxCount = count;
      maxCountry = country;
    }
  }

  return maxCountry;
};

export const dedupeCanonicalSchools = (
  schools: CanonicalSchool[]
): CanonicalSchool[] => {
  const map = new Map<string, CanonicalSchool>();

  for (const school of schools) {
    const schoolKey = normalizeSchoolNameForSimilarityCheck(
      school.canonicalName
    );
    if (!map.has(schoolKey)) {
      map.set(schoolKey, school);
    }
  }

  return Array.from(map.values());
};
