// One-off seed: creates the "users" table and an Administrator user (id 1),
// matching the original database-template.json. Safe to re-run (skips if present).
//
// Usage:
//   TABLES_CONNECTION_STRING="<storage connection string>" node seed.js
// For the local Azurite emulator you can omit it (defaults to UseDevelopmentStorage=true).

const { TableClient } = require("@azure/data-tables");

const CONN =
  process.env.TABLES_CONNECTION_STRING ||
  process.env.AzureWebJobsStorage ||
  "UseDevelopmentStorage=true";

const ADMIN = {
  partitionKey: "user",
  rowKey: "1",
  name: "Administrator",
  email: "admin@rm.com",
  isAdmin: true,
};

(async () => {
  const client = TableClient.fromConnectionString(CONN, "users", {
    allowInsecureConnection: true,
  });
  await client.createTable().catch((err) => {
    if (err?.statusCode !== 409) throw err;
  });

  try {
    await client.getEntity(ADMIN.partitionKey, ADMIN.rowKey);
    console.log("Admin user already exists — nothing to do.");
  } catch (err) {
    if (err?.statusCode !== 404) throw err;
    await client.createEntity(ADMIN);
    console.log("Seeded Administrator user (id 1, email admin@rm.com).");
  }
})().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
