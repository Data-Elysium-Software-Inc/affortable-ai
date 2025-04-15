// import { config } from "dotenv";
// import { drizzle } from "drizzle-orm/postgres-js";
// import { migrate } from "drizzle-orm/postgres-js/migrator";
// import postgres from "postgres";

// config({
//   path: ".env",
// });
 
// const runMigrate = async () => {
//   if (!process.env.POSTGRES_URL) {
//     throw new Error("POSTGRES_URL is not defined");
//   }

//   const connection = postgres(process.env.POSTGRES_URL, { max: 1 });
//   const db = drizzle(connection);

//   console.log("⏳ Checking migration status...");

//   // Fetch all completed migrations
//   const migrations = await db.query.__drizzle_migrations.findMany({
//     where: {
//       status: "completed",
//     },
//   });

//   if (migrations.length > 0) {
//     console.log("✅ Database is already up-to-date. Skipping migrations.");
//     process.exit(0);
//   }

//   console.log("⏳ Running migrations...");
//   const start = Date.now();
//   await migrate(db, { migrationsFolder: "./lib/db/migrations" });
//   const end = Date.now();

//   console.log("✅ Migrations completed in", end - start, "ms");
//   process.exit(0);
// };

// runMigrate().catch((err) => {
//   console.error("❌ Migration failed");
//   console.error(err);
//   process.exit(1);
// });

// Old conflicting migrate.ts
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

config({
  path: ".env",
});

const runMigrate = async () => {
  if (!process.env.POSTGRES_URL) {
    throw new Error("POSTGRES_URL is not defined");
  }

  const connection = postgres(process.env.POSTGRES_URL, { max: 1 });
  const db = drizzle(connection);

  console.log("⏳ Running migrations...");

  const start = Date.now();
  await migrate(db, { migrationsFolder: "./lib/db/migrations" });
  const end = Date.now();

  console.log("✅ Migrations completed in", end - start, "ms");
  process.exit(0);
};

runMigrate().catch((err) => {
  console.error("❌ Migration failed");
  console.error(err);
  process.exit(1);
});
//test
