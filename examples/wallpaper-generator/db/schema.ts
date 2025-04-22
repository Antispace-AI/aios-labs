import { sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core"
import { v7 as uuid } from "uuid"

export enum Category {
  Travel = 1,
  Wedding = 2,
  Portrait = 3,
}

const timestamps = {
  createdAt: text("timestamp").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .$defaultFn(() => new Date().toISOString())
    .$onUpdate(() => new Date().toISOString()),
}

export const users = sqliteTable("users", {
  id: text("id")
    .notNull()
    .$defaultFn(() => uuid())
    .primaryKey(),
  replicateKey: text("replicateKey"),
  ...timestamps,
})

export const generations = sqliteTable("generations", {
  id: text("id")
    .notNull()
    .$defaultFn(() => uuid())
    .primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  prompt: text("prompt").notNull(),
  result: text("result"),

  ...timestamps,
})

export type User = typeof users.$inferInsert & { id: string }
export type Generation = typeof generations.$inferInsert & { id: string }
