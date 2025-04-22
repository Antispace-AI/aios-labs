import { migrate } from "drizzle-orm/bun-sqlite/migrator"

// @ts-expect-error
import { Database } from "bun:sqlite"
import { drizzle } from "drizzle-orm/bun-sqlite"

const sqlite = new Database("sqlite.db")
const db = drizzle(sqlite)

await migrate(db, { migrationsFolder: "./drizzle" })
