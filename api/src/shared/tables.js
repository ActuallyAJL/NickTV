// Shared Azure Table Storage helpers for the NickTV API.
//
// Design notes:
// - One table per resource (users / favorites / reviews), single partition each.
// - IDs are numeric (Date.now()) to preserve the client's strict-equality checks
//   (e.g. `thisFav.userId === currentUser`, where currentUser is a parseInt'd number).
//   RowKey must be a string, so we store String(id) and surface `id` as a Number.
// - Data volumes are tiny (a personal app), so we list a partition and filter in JS
//   rather than building OData filters — this faithfully mimics json-server's loose
//   query-param matching (e.g. `?movieId=123` matching a stored number 123).

const { TableClient } = require("@azure/data-tables");

const CONN =
  process.env.TABLES_CONNECTION_STRING || process.env.AzureWebJobsStorage;

// Table Storage reserved/system property names we never persist from a request body.
const SYSTEM_PROPS = new Set([
  "partitionKey",
  "rowKey",
  "etag",
  "timestamp",
  "PartitionKey",
  "RowKey",
  "Timestamp",
  "ETag",
]);

const clients = {};

async function getClient(table) {
  if (!CONN) {
    throw new Error(
      "No storage connection string. Set TABLES_CONNECTION_STRING (or AzureWebJobsStorage) " +
        "in the Function App settings (or local.settings.json for local dev)."
    );
  }
  if (!clients[table]) {
    const client = TableClient.fromConnectionString(CONN, table, {
      // Required for the local Azurite emulator (http); harmless against real storage (https).
      allowInsecureConnection: true,
    });
    // Create-if-not-exists; ignore the 409 when it already exists.
    await client.createTable().catch((err) => {
      if (err?.statusCode !== 409) throw err;
    });
    clients[table] = client;
  }
  return clients[table];
}

// Strip Table system columns and surface a numeric `id` (mirrors json-server's shape).
function fromEntity(entity) {
  const out = {};
  for (const [k, v] of Object.entries(entity)) {
    if (SYSTEM_PROPS.has(k)) continue;
    out[k] = v;
  }
  out.id = Number(entity.rowKey);
  return out;
}

// Build a Table entity from a request body. Drops `id`, system props, nulls, and any
// nested objects/arrays (Table columns must be primitives — this also discards the
// `user` object that comes back from an `_expand=user` read before a PATCH writes it).
function toEntity(partitionKey, id, body) {
  const entity = { partitionKey, rowKey: String(id) };
  for (const [k, v] of Object.entries(body || {})) {
    if (k === "id" || SYSTEM_PROPS.has(k)) continue;
    if (v === null || typeof v === "object") continue;
    entity[k] = v;
  }
  return entity;
}

async function listPartition(table, partitionKey) {
  const client = await getClient(table);
  const items = [];
  const entities = client.listEntities({
    queryOptions: { filter: `PartitionKey eq '${partitionKey}'` },
  });
  for await (const e of entities) items.push(fromEntity(e));
  return items;
}

// Monotonic-ish numeric id. Date.now() is unique enough for a single-user personal app;
// the small extra counter guards against collisions within the same millisecond.
let lastId = 0;
function newId() {
  let id = Date.now();
  if (id <= lastId) id = lastId + 1;
  lastId = id;
  return id;
}

function json(body, status = 200) {
  return {
    status,
    headers: { "Content-Type": "application/json" },
    jsonBody: body,
  };
}

module.exports = {
  getClient,
  fromEntity,
  toEntity,
  listPartition,
  newId,
  json,
};
