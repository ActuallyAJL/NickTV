const { app } = require("@azure/functions");
const {
  getClient,
  fromEntity,
  toEntity,
  listPartition,
  newId,
  json,
} = require("../shared/tables");

const TABLE = "reviews";
const PARTITION = "review";
const USERS_TABLE = "users";
const USERS_PARTITION = "user";

// Attach the related user object to each review (replicates json-server's `_expand=user`,
// which ReviewCard relies on via `thisReview.user?.name`).
async function expandUsers(reviews) {
  const users = await listPartition(USERS_TABLE, USERS_PARTITION);
  const byId = new Map(users.map((u) => [String(u.id), u]));
  return reviews.map((r) => ({ ...r, user: byId.get(String(r.userId)) || null }));
}

// Mirrors the json-server `/reviews` endpoints the client uses:
//   GET    /api/reviews?movieId=<id>&_expand=user   (ReviewList)
//   GET    /api/reviews?userId=<id>                 (parity)
//   GET    /api/reviews/{id}                        (parity)
//   POST   /api/reviews                             (add review)
//   PATCH  /api/reviews/{id}                        (edit review)
//   DELETE /api/reviews/{id}                        (delete review)
app.http("reviews", {
  route: "reviews/{id?}",
  methods: ["GET", "POST", "PATCH", "DELETE"],
  authLevel: "anonymous",
  handler: async (request) => {
    const client = await getClient(TABLE);
    const { id } = request.params;

    if (request.method === "GET") {
      if (id) {
        try {
          const entity = await client.getEntity(PARTITION, id);
          let review = fromEntity(entity);
          if (request.query.get("_expand") === "user") {
            [review] = await expandUsers([review]);
          }
          return json(review);
        } catch (err) {
          if (err?.statusCode === 404) return json({}, 404);
          throw err;
        }
      }
      let reviews = await listPartition(TABLE, PARTITION);
      const movieId = request.query.get("movieId");
      const userId = request.query.get("userId");
      if (movieId !== null) {
        reviews = reviews.filter((r) => String(r.movieId) === movieId);
      }
      if (userId !== null) {
        reviews = reviews.filter((r) => String(r.userId) === userId);
      }
      if (request.query.get("_expand") === "user") {
        reviews = await expandUsers(reviews);
      }
      return json(reviews);
    }

    if (request.method === "POST") {
      const body = await request.json();
      const entity = toEntity(PARTITION, newId(), body);
      await client.createEntity(entity);
      return json(fromEntity(entity), 201);
    }

    if (request.method === "PATCH") {
      if (!id) return json({ error: "id is required" }, 400);
      const body = await request.json();
      // toEntity drops the `id` and the expanded `user` object before writing.
      const entity = toEntity(PARTITION, id, body);
      await client.updateEntity(entity, "Merge");
      const updated = await client.getEntity(PARTITION, id);
      return json(fromEntity(updated));
    }

    // DELETE /api/reviews/{id}
    if (!id) return json({ error: "id is required" }, 400);
    try {
      await client.deleteEntity(PARTITION, id);
    } catch (err) {
      if (err?.statusCode !== 404) throw err;
    }
    return json({});
  },
});
