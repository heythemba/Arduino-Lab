# Arduino-Lab Codebase Overview

This file documents the main source files in the project and summarizes the contents of each file. AI agents can scan this file first to understand the project structure and direct edits without scanning the entire repository.

## Root

- `next.config.ts` — Next.js configuration for the application.

## `src/lib`

- `env.ts` — Validates environment variables with Zod and exports typed runtime config.
- `utils.ts` — Shared utility helpers such as the Tailwind class name merger `cn()`.
- `validations.ts` — Zod schemas and safe JSON parsing utilities for project steps and attachments.
- `commentParser.tsx` — Minimal markdown-like parser for rendering comment text and code blocks.
- `api/settings.ts` — Functions to fetch and update site settings from Supabase.
- `api/projects.ts` — Data access helpers for projects, including list fetching and slug-based detail retrieval.

## `src/lib/supabase`

- `client.ts` — Browser-side Supabase client creation for client components.
- `server.ts` — Server-side Supabase client creation for server components, actions, and route handlers.
- `middleware.ts` — Middleware that refreshes Supabase sessions and integrates next-intl routing.

## `src/i18n`

- `routing.ts` — next-intl locale routing config and navigation wrappers.
- `request.ts` — Locale-aware request utility (not yet fully scanned in this summary).

## `src/components/ui`

- `button.tsx` — Shared button primitive with variant and size styling using CVA.
- `card.tsx` — Reusable card container primitives for structured UI sections.
- `input.tsx` — Shared input component for consistent form styling.
- `label.tsx` — Accessible form label primitive using Radix UI.
- `RichTextEditor.tsx` — Client-side rich text editor using Tiptap, used for comment and project text input.
- `skeleton.tsx` — Generic skeleton loader for loading states.

## `src/components/admin`

- `ProjectForm.tsx` — Complex admin project create/edit form with multilingual inputs, AI generation, translation, steps, attachments, and draft handling.
- `SettingsForm.tsx` — Admin form for editing site-wide settings like contact links and image host URLs.
- `RecentCommentsList.tsx` — Admin dashboard component showing recent comments activity.
- `FileUploader.tsx` — File attachment uploader for project assets, supporting uploads and external links.
- `ImageUploader.tsx` — Drag-and-drop image uploader backed by `/api/upload-image`.
- `DeleteProjectButton.tsx` — Delete-confirmation UI for removing projects.

## `src/components/comments`

- `CommentSection.tsx` — Server-rendered wrapper that loads current user and comment list for a project.
- `CommentForm.tsx` — Client-side comment submission form using server actions.
- `CommentList.tsx` — Sortable comment list component with recent/liked toggles.
- `CommentItem.tsx` — Comment row renderer with avatar, content parsing, like button, and delete action.
- `LikeButton.tsx` — Client-side like toggling control for comments.
- `CodeBlock.tsx` — Styled code block renderer used inside comments.

## `src/components`

- `Navbar.tsx` — Global navigation bar with locale selector, auth actions, and mobile menu.
- `Footer.tsx` — Global footer that loads site settings and renders contact/social links.
- `Hero.tsx` — Homepage hero section with CTA buttons and release notes modal.
- `ProjectCard.tsx` — Project preview card shown in the public project grid.
- `ProjectHeader.tsx` — Detail page hero header for a single project.
- `StepList.tsx` — Project step timeline renderer with image modal and code snippet support.
- `ProjectJsonLd.tsx` — Structured JSON-LD markup for SEO and rich results.
- `ShareButton.tsx` — Copy-to-clipboard share button.
- `SearchFilters.tsx` — Search bar and category filter for the project gallery.
- `ScrollToTop.tsx` — Floating scroll-to-top control.
- `ReleaseNotesModal.tsx` — Release notes modal displayed on the homepage.
- `ImageModal.tsx` — Fullscreen image modal for step images.
- `AiNotificationPopup.tsx` — AI success/error popup used in project form flows.
- `CodeSnippet.tsx` — Display component for Arduino/C++ code snippets.

## `src/app`

- `layout.tsx` — Root app layout that currently forwards children and delegates to locale layouts.
- `not-found.tsx` — Global 404 page for non-localized routes.
- `robots.ts` — Robots.txt generation, disallowing admin/auth and pointing to sitemap.
- `sitemap.ts` — Sitemap generator for locale-aware public pages and project detail pages.

## `src/app/auth`

- `layout.tsx` — Minimal layout wrapper for auth-related routes.
- `actions.ts` — Server actions for sign-in and sign-out with Supabase.
- `callback/route.ts` — OAuth callback route that exchanges Supabase auth codes for sessions.

## `src/app/actions`

- `comment.ts` — Server actions and query helpers for adding, deleting, liking, and fetching comments.

## `src/app/api`

- `upload-image/route.ts` — Server-side proxy route for uploading images to FreeImage.host.
- `generate/route.ts` — AI generation endpoint for creating project titles, descriptions, and starter steps.
- `translate-step/route.ts` — AI translation endpoint for step content across en/fr/ar.

## `src/app/[locale]`

- `layout.tsx` — Localized app layout that loads translations, determines RTL direction, and fetches the Supabase user profile.
- `page.tsx` — Localized homepage listing projects with search and filters.
- `loading.tsx` — Homepage skeleton loading state.
- `not-found.tsx` — Localized 404 page.

## `src/app/[locale]/login`

- `page.tsx` — Locale-aware login page that redirects authenticated users to the admin dashboard.
- `LoginForm.tsx` — Login form component with password visibility toggle.

## `src/app/[locale]/about`

- `page.tsx` — Localized About page with mission/story content.
- `loading.tsx` — Skeleton state for the About page.

## `src/app/[locale]/projects/[slug]`

- `page.tsx` — Project detail page rendering project metadata, steps, resources, and comments.
- `loading.tsx` — Skeleton loading state for project pages.

## `src/app/[locale]/admin`

- `page.tsx` — Admin dashboard listing projects and admin controls.
- `loading.tsx` — Admin dashboard loading skeleton.

## `src/app/[locale]/admin/settings`

- `page.tsx` — Admin settings page.
- `loading.tsx` — Settings page loading skeleton.

## `src/app/[locale]/admin/users/new`

- `page.tsx` — New user creation form for admins.

## `src/app/[locale]/admin/projects/new`

- `page.tsx` — Create a new project page.
- `loading.tsx` — New project form loading skeleton.

## `src/app/[locale]/admin/projects/[slug]/edit`

- `page.tsx` — Edit project page that loads existing project data into `ProjectForm`.

---

### How to use this file

1. Scan the sections to find the target area (public pages, admin pages, API routes, UI components).
2. Open the referenced file(s) for the exact implementation details.
3. This file is intended to avoid full repository scans and provide a quick navigation map.
