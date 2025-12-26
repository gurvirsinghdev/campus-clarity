import request from "graphql-request";
import { Hono } from "hono";
import { z } from "zod";
import { graphqlEndpoint } from "./graphql/config";
import {
  schoolSearchQuery,
  type SchoolSearchQueryValidResponse,
} from "./graphql/schoolSearch";
import {
  cleanSchool,
  createCanonicalSchools,
  dedupeCanonicalSchools,
  dedupeSchools,
  groupSchools,
} from "./helpers/school";
import { cors } from "hono/cors";

/**
 * Creating the Hono Application.
 */
const app = new Hono().basePath("/api").use(
  cors({
    origin: "*",
    allowMethods: ["*"],
    allowHeaders: ["*"],
  })
);

/**
 * Setting up API routes.
 */
app.get("/schools");
app.get("/schools/:schoolID");

app.get("/schools/search", async (c) => {
  const requestQuerySchema = z.object({
    q: z.string().min(1, "Query parameter q cannot be empty."),
  });

  /**
   * Parsing the query parameters from the request url.
   */
  const selfUrl = new URL(c.req.url.toString());
  const queryParams = new URLSearchParams(selfUrl.search);
  const requestQuery = requestQuerySchema.parse(
    Object.fromEntries(queryParams.entries())
  );

  /**
   * Sending the request to the actual server.
   */
  const response = (await request(graphqlEndpoint, schoolSearchQuery, {
    query: {
      text: requestQuery.q,
    },
  })) as SchoolSearchQueryValidResponse | undefined;

  /** If we have the valid response, continue processing. */
  if (response) {
    const apiResponse = {
      schools: dedupeCanonicalSchools(
        createCanonicalSchools(
          groupSchools(
            dedupeSchools(
              response.newSearch.schools.edges.map((edge) => ({
                ...cleanSchool(edge.node),
                cursor: edge.cursor,
              }))
            )
          )
        )
      ),
      pageInfo: response.newSearch.schools.pageInfo,
    };

    return c.json(apiResponse);
  }

  /**
   * Sending the response directly back to the client.
   */
  return c.json({
    schools: [],
    pageInfo: null,
  });
});

/**
 * Starting the backend server on 8000 PORT.
 */
export default {
  port: 8000,
  fetch: app.fetch,
};
