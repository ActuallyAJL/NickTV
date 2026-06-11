const { app } = require("@azure/functions");
const {
  getClient,
  fromEntity,
  toEntity,
  listPartition,
  newId,
  json,
} = require("../shared/tables");

const TABLE = "favorites";
const PARTITION = "favorite";

// Mirrors the json-server `/favorites` endpoints the client uses:
//   GET    /api/favorites?movieId=<id>   (MovieDetails: is this movie favorited)
//   GET    /api/favorites?userId=<id>    (parity)
//   POST   /api/favorites                (add favorite)
//   DELETE /api/favorites/{id}           (remove favorite)
app.http("favorites", {
  route: "favorites/{id?}",
  methods: ["GET", "POST", "DELETE"],
  authLevel: "anonymous",
  handler: async (request) => {
    const client = await getClient(TABLE);
    const { id } = request.params;

    if (request.method === "GET") {
      let favorites = await listPartition(TABLE, PARTITION);
      const movieId = request.query.get("movieId");
      const userId = request.query.get("userId");
      // Loose string compare mirrors json-server (?movieId=123 matches stored number 123).
      if (movieId !== null) {
        favorites = favorites.filter((f) => String(f.movieId) === movieId);
      }
      if (userId !== null) {
        favorites = favorites.filter((f) => String(f.userId) === userId);
      }
      return json(favorites);
    }

    if (request.method === "POST") {
      const body = await request.json();
      const entity = toEntity(PARTITION, newId(), body);
      await client.createEntity(entity);
      return json(fromEntity(entity), 201);
    }

    // DELETE /api/favorites/{id}
    if (!id) return json({ error: "id is required" }, 400);
    try {
      await client.deleteEntity(PARTITION, id);
    } catch (err) {
      if (err?.statusCode !== 404) throw err;
    }
    return json({});
  },
});
