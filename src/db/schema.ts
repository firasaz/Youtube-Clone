import { relations } from "drizzle-orm";
import {
  foreignKey,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";

export const reactionType = pgEnum("reaction_type", ["like", "dislike"]);

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
  t => [uniqueIndex("clerk_id_idx").on(t.clerkId)]
);
export const useRelations = relations(users, ({ many }) => ({
  videos: many(videos),
  videoViews: many(videoViews),
  videoReactions: many(videoReactions),
  subscriptions: many(subscriptions, {
    relationName: "subscriptions_viewer_id_fkey",
  }),
  subscribers: many(subscriptions, {
    relationName: "subscriptions_creator_id_fkey",
  }),
  comments: many(comments),
  commentReactions: many(commentReactions),
  playlists: many(playlists), // user can have many playlists
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
  t => [uniqueIndex("name_idx").on(t.name)]
);
export const categoryRelations = relations(users, ({ many }) => ({
  videos: many(videos),
}));

export const videoVisibility = pgEnum("video_visibility", [
  "private",
  "public",
]);
export const videos = pgTable("videos", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  userId: uuid("user_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  categoryId: uuid("category_id").references(() => videoCategories.id, {
    onDelete: "set null",
  }),
  thumbnailUrl: text("thumbnail_url"),
  thumbnailKey: text("thumbnail_key"),
  previewUrl: text("preview_url"),
  duration: integer("duration").default(0).notNull(),
  visibility: videoVisibility("visibility").default("private").notNull(),
  muxStatus: text("mux_status"), // handle status of the video
  muxUploadId: text("mux_upload_id").unique(), // upload id when an upload request is first initiated
  muxAssetId: text("mux_asset_id").unique(), // id for when the video is full uploaded
  muxPlaybackId: text("mux_playback_id").unique(),
  muxTrackId: text("mux_track_id").unique(),
  muxTrackStatus: text("mux_track_status"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
export const videoRelations = relations(videos, ({ one, many }) => ({
  user: one(users, {
    fields: [videos.userId],
    references: [users.id],
  }),
  category: one(videoCategories, {
    fields: [videos.categoryId],
    references: [videoCategories.id],
  }),
  views: many(videoViews),
  reactions: many(videoReactions),
  comments: many(comments),
}));

export const videoSelectSchema = createSelectSchema(videos);
export const videoInsertSchema = createInsertSchema(videos);
export const videoUpdateSchema = createUpdateSchema(videos);

// Comments Schema
export const comments = pgTable(
  "comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    parentId: uuid("parent_id"),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    videoId: uuid("video_id")
      .references(() => videos.id, { onDelete: "cascade" })
      .notNull(),
    value: text("value").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  t => {
    return [
      foreignKey({
        columns: [t.parentId],
        foreignColumns: [t.id],
        name: "comments_parent_id_fkey",
      }).onDelete("cascade"),
    ];
  }
);
export const commentsRelations = relations(comments, ({ one, many }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  video: one(videos, {
    fields: [comments.videoId],
    references: [videos.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: "comment_parent_id_fkey",
  }),
  reactions: many(commentReactions),
  replies: many(comments, {
    relationName: "comments_parent_id_fkey",
  }),
}));

export const commentInsertSchema = createInsertSchema(comments);

export const commentReactions = pgTable(
  "comment_reactions",
  {
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    commentId: uuid("comment_id")
      .references(() => comments.id, { onDelete: "cascade" })
      .notNull(),
    type: reactionType("type").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  t => [
    primaryKey({
      name: "comment_reactions_pk",
      columns: [t.userId, t.commentId],
    }),
  ]
);
export const commentReactionRelations = relations(
  commentReactions,
  ({ one }) => ({
    user: one(users, {
      fields: [commentReactions.userId],
      references: [users.id],
    }),
    comment: one(comments, {
      fields: [commentReactions.commentId],
      references: [comments.id],
    }),
  })
);

export const videoViews = pgTable(
  "video_views",
  {
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    videoId: uuid("video_id")
      .references(() => videos.id, { onDelete: "cascade" })
      .notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  t => [
    primaryKey({
      name: "video_views_pk",
      columns: [t.userId, t.videoId],
    }),
  ]
);
export const videoViewRelations = relations(videoViews, ({ one }) => ({
  user: one(users, {
    fields: [videoViews.userId],
    references: [users.id],
  }),
  video: one(videos, {
    fields: [videoViews.videoId],
    references: [videos.id],
  }),
}));

export const videoViewSelectSchema = createSelectSchema(videoViews);
export const videoViewInsertSchema = createInsertSchema(videoViews);
export const videoViewUpdateSchema = createUpdateSchema(videoViews);

export const videoReactions = pgTable(
  "video_reactions",
  {
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    videoId: uuid("video_id")
      .references(() => videos.id, { onDelete: "cascade" })
      .notNull(),
    type: reactionType("type").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  t => [
    primaryKey({
      name: "video_reactions_pk",
      columns: [t.userId, t.videoId],
    }),
  ]
);
export const videoReactionRelations = relations(videoReactions, ({ one }) => ({
  user: one(users, {
    fields: [videoReactions.userId],
    references: [users.id],
  }),
  video: one(videos, {
    fields: [videoReactions.videoId],
    references: [videos.id],
  }),
}));
export const videoReactionSelectSchema = createSelectSchema(videoReactions);
export const videoReactionInsertSchema = createInsertSchema(videoReactions);
export const videoReactionUpdateSchema = createUpdateSchema(videoReactions);

export const subscriptions = pgTable(
  "subscriptions",
  {
    viewerId: uuid("viewer_id")
      .references(() => users.id, {
        onDelete: "cascade",
      })
      .notNull(),
    creatorId: uuid("creator_id")
      .references(() => users.id, {
        onDelete: "cascade",
      })
      .notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  t => [
    primaryKey({
      name: "subscriptions_pk",
      columns: [t.viewerId, t.creatorId],
    }),
  ]
);
export const subscriptionRelations = relations(subscriptions, ({ one }) => ({
  viewerId: one(users, {
    fields: [subscriptions.viewerId],
    references: [users.id],
    relationName: "subscriptions_viewer_id_fkey",
  }),
  creatorId: one(users, {
    fields: [subscriptions.creatorId],
    references: [users.id],
    relationName: "subscriptions_creator_id_fkey",
  }),
}));

export const playlists = pgTable("playlists", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
export const playlistRelations = relations(playlists, ({ one, many }) => ({
  user: one(users, {
    fields: [playlists.userId],
    references: [users.id],
  }),
  playlistVideos: many(playlistVideos),
}));

export const playlistVideos = pgTable(
  "playlist_videos",
  {
    playlistId: uuid("playlist_id")
      .references(() => playlists.id, { onDelete: "cascade" })
      .notNull(),
    videoId: uuid("video_id")
      .references(() => videos.id, { onDelete: "cascade" })
      .notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  t => [
    primaryKey({
      name: "playlist_videos_pk",
      columns: [t.playlistId, t.videoId],
    }),
  ]
);
export const playlistVideoRelations = relations(playlistVideos, ({ one }) => ({
  playlist: one(playlists, {
    fields: [playlistVideos.playlistId],
    references: [playlists.id],
  }),
  video: one(videos, {
    fields: [playlistVideos.videoId],
    references: [videos.id],
  }),
}));

export const serviceLogs = pgTable("services_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  service_name: text("service_name").notNull(),
  request_body: jsonb("request_body"),
  response_body: jsonb("response_body").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
