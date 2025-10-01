# Utube
This is Utube. It is a Youtube Clone, built entirely with NextJS. It utilizes all the features of SSR, while also getting the benefits of ReactJS in the frontend.

## 🛠️ Technology Stack
- [NextJS](https://nextjs.org/)
- [ReactJS](https://react.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [Shadcn/UI](https://ui.shadcn.com/)
- [NeonDB](https://neon.com/) - PostgreSQL
- [Drizzle ORM](https://orm.drizzle.team/), for managing DB in code
- [tRPC](https://trpc.io/docs/), for end-to-end typesafe APIs


## 🚀 Features
1. Sign Up / Sign In using `OAuth` accounts such as Google OAuth or Github using [`Clerk`](https://clerk.com/) for Authentication managing.
2. Watch videos uploaded by other creators on the platform without signing in.
3. Upload videos and manage uploaded videos using Utube Studio.
4. Generate video title and description using AI by supplying your AI-assistant with the video transcript by default.
5. Upload a transcript associated with the uploaded video or let the platform generate it and use it in the video automatically. Auto-generated transcript can be downloaded and modified as per needed.
6. Allow users to filter videos on the platform using the category filter found in the home page.

## 🗂️ Folder Structure
```
/src                   - Full project wrapper
    /app               - Next.js app directory
    /components        - Reusable React components
    /trpc              - tRPC routers and API logic
    /db                - Drizzle ORM setup and migrations
    /modules           - Includes all the different parts of the project such as UI components & sections, tRPC procedures, & custom hooks related
/tailwind.config.ts    - TailwindCSS configurations
```
# src

* [app/](./src/app)
  * [(auth)/](./src/app/(auth))
  * [(home)/](./src/app/(home))
  * [(studio)/](./src/app/(studio))
  * [api/](./src/app/api)
  * [favicon.ico](./src/app/favicon.ico)
  * [globals.css](./src/app/globals.css)
  * [layout.tsx](./src/app/layout.tsx)
* [components/](./src/components)
  * [ui/](./src/components/ui)
  * [filter-carousel.tsx](./src/components/filter-carousel.tsx)
  * [infinite-scroll.tsx](./src/components/infinite-scroll.tsx)
  * [responsive-modal.tsx](./src/components/responsive-modal.tsx)
  * [user-avatar.tsx](./src/components/user-avatar.tsx)
* [db/](./src/db)
  * [index.ts](./src/db/index.ts)
  * [schema.ts](./src/db/schema.ts)
* [hooks/](./src/hooks)
  * [use-intersection-observer.ts](./src/hooks/use-intersection-observer.ts)
  * [use-mobile.tsx](./src/hooks/use-mobile.tsx)
  * [use-toast.ts](./src/hooks/use-toast.ts)
* [lib/](./src/lib)
  * [mux.ts](./src/lib/mux.ts)
  * [ratelimit.ts](./src/lib/ratelimit.ts)
  * [redis.ts](./src/lib/redis.ts)
  * [uploadthing.ts](./src/lib/uploadthing.ts)
  * [utils.ts](./src/lib/utils.ts)
  * [workflow.ts](./src/lib/workflow.ts)
* [modules/](./src/modules)
  * [auth/](./src/modules/auth)
  * [comments/](./src/modules/comments)
  * [home/](./src/modules/home)
  * [studio/](./src/modules/studio)
  * [subscriptions/](./src/modules/subscriptions)
  * [users/](./src/modules/users)
  * [video-reactions/](./src/modules/video-reactions)
  * [video-views/](./src/modules/video-views)
  * [videoCategories/](./src/modules/videoCategories)
  * [videos/](./src/modules/videos)
* [scripts/](./src/scripts)
  * [seed-categories.ts](./src/scripts/seed-categories.ts)
* [trpc/](./src/trpc)
  * [routers/](./src/trpc/routers)
  * [client.tsx](./src/trpc/client.tsx)
  * [init.ts](./src/trpc/init.ts)
  * [query-client.ts](./src/trpc/query-client.ts)
  * [server.tsx](./src/trpc/server.tsx)
* [constants.ts](./src/constants.ts)
* [middleware.ts](./src/middleware.ts)



## 📦 Getting Started
```
git clone https://github.com/firasaz/Youtube-Clone.git Utube
cd Utube
bun install
bun dev
```
#### Local URL:
[http://localhost:3000](http://localhost:3000)