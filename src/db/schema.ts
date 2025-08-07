import { relations } from "drizzle-orm";
import {
  integer,
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
export const useRelations = relations(users, ({ many }) => ({
  videos: many(videos),
}));

export const videoCategories = pgTable(
  "video_categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  // add index to query using category name
  (t) => [uniqueIndex("name_idx").on(t.name)]
);
export const categoryRelations = relations(users, ({ many }) => ({
  videos: many(videos),
}));

export const videos = pgTable("videos", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  likes: integer("likes_count").default(0),
  dislikes: integer("dislikes_count").default(0),
  userId: uuid("user_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  categoryId: uuid("category_id").references(() => videoCategories.id, {
    onDelete: "set null",
  }),
  muxStatus: text("mux_status"), // handle status of the video
  muxUploadId: text("mux_upload_id").unique(), // upload id when an upload request is first initiated
  muxAssetId: text("mux_asset_id").unique(), // id for when the video is full uploaded
  muxPlaybackId: text("mux_playback_id").unique(),
  muxTrackId: text("mux_track_id").unique(),
  muxTrackStatus: text("mux_track_status").unique(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
export const videoRelations = relations(videos, ({ one }) => ({
  user: one(users, {
    fields: [videos.userId],
    references: [users.id],
  }),
  category: one(videoCategories, {
    fields: [videos.categoryId],
    references: [videoCategories.id],
  }),
}));

export const serviceLogs = pgTable("services_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  service_name: text("service_name").notNull(),
  request_body: jsonb("request_body"),
  response_body: jsonb("response_body").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
