// @ts-expect-error
import { Database } from "bun:sqlite"
import { drizzle } from "drizzle-orm/bun-sqlite"

const sqlite = new Database("sqlite.db")
export const db = drizzle(sqlite)

export default db
