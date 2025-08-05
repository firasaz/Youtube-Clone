import {
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkId: text("clerk_id").unique().notNull(), // can use this as the primary key
    name: text("name").notNull(),
    // TODO: add banner fields later

    imageUrl: text("image_url").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("clerk_id_idx").on(t.clerkId)]
);

export const videoCategories = pgTable(
  "video_categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull().unique(),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
  },
  // add index to query using category name
  (t) => [uniqueIndex("name_idx").on(t.name)]
);

export const serviceLogs = pgTable("services_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  service_name: text("service_name").notNull(),
  request_body: jsonb("request_body"),
  response_body: jsonb("response_body").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
