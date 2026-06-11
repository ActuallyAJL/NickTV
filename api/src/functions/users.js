const { app } = require("@azure/functions");
const {
  getClient,
  fromEntity,
  toEntity,
  listPartition,
  newId,
  json,
} = require("../shared/tables");

const TABLE = "users";
const PARTITION = "user";

// Mirrors the json-server `/users` endpoints the client uses:
//   GET  /api/users?email=<email>   (login + register existence check)
//   POST /api/users                 (register)
//   GET  /api/users/{id}            (convenience / parity)
app.http("users", {
  route: "users/{id?}",
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  handler: async (request) => {
    const client = await getClient(TABLE);
    const { id } = request.params;

    if (request.method === "GET") {
      if (id) {
        try {
          const entity = await client.getEntity(PARTITION, id);
          return json(fromEntity(entity));
        } catch (err) {
          if (err?.statusCode === 404) return json({}, 404);
          throw err;
        }
      }
      let users = await listPartition(TABLE, PARTITION);
      const email = request.query.get("email");
      if (email !== null) {
        users = users.filter((u) => String(u.email) === email);
      }
      return json(users);
    }

    // POST — create a user
    const body = await request.json();
    const entity = toEntity(PARTITION, newId(), body);
    await client.createEntity(entity);
    return json(fromEntity(entity), 201);
  },
});
