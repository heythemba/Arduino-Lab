# Changelog

All notable changes to **ArduinoLab** are documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) conventions.

---

## [2.2.6] — AI Templates & Localization — 2026-02-24

### Added
- 🤖 **AI Project Templates** — Integrated an auto-generated project base template in the creation flow, allowing users to start with a structured draft powered by AI.

### Fixed
- 🌍 **Category Translations** — Resolved an issue where project category options were hardcoded in English; they are now fully localized into English, French, and Arabic.

---

## [2.0.4] — Step Layout — 2026-02-24

### Changed
- **Step timeline layout** redesigned from alternating zigzag (50% width cards) to a single-side layout where all steps are pinned to the **start edge** of the timeline — left in EN/FR, right in AR.
- Step cards now use `flex-1` filling the full available width (~85%) instead of 50%, drastically reducing whitespace and giving long text much more room.
- Vertical gap between steps reduced from `space-y-16` to `space-y-8` for a tighter, cleaner reading flow.
- Timeline line position uses `ms-5` (logical CSS, inline-start) so it correctly flips to the right edge in RTL without any extra code.

---

## [2.0.3] — Slug Validation — 2026-02-23

### Fixed
- **Slug input** in the Create/Edit project form had no input control — users could type spaces, numbers, uppercase letters, or very long strings, causing URL and database issues.

### Added
- Real-time slug sanitization: only `a-z` and hyphens (`-`) are accepted; all other characters are silently stripped as you type.
- Space key explicitly blocked at the keyboard level.
- Hard cap of **20 characters** enforced both by `maxLength` attribute and JavaScript sanitization.
- Live character counter (`0/20`) displayed inside the input field, turning red at the limit.
- Helper hint text below the field: *"Only lowercase letters (a-z) and hyphens. Max 20 chars."*
- Slug input now fully controlled (works correctly in both **Create** and **Edit** mode).

---

## [2.0.1] — Hotfix & i18n Completeness — 2026-02-23

### Fixed
- **ProjectCard button** ("View Project") was not translating in Arabic or French — now fully hooked into `next-intl`.
- **Comment sort button** ("Most recent" / "Most liked") was hardcoded in English — now uses `next-intl` translation keys `sortRecent` / `sortLiked`.
- **Project Details resource headers** ("CODE", "3D MODELS") were hardcoded — now translated via `ProjectDetails.code` and `ProjectDetails.models` keys.
- **"Back to Gallery" button** in `ProjectHeader` was hardcoded — now uses `ProjectDetails.backToGallery` translation key.
- **PNL Mahdia link** was missing from the mobile hamburger menu — now appears at the top of the mobile nav.
- **Blank screen on local dev** caused by a Cloudflare middleware hack (`x-middleware-next` header deletion) that was inadvertently left in the codebase — reverted.

### Added
- `ProjectCard.viewProject` key to `en.json`, `fr.json`, `ar.json`.
- `Comments.sortRecent` and `Comments.sortLiked` keys to all locale files.
- `ProjectDetails.code`, `ProjectDetails.models`, `ProjectDetails.backToGallery` keys to all locale files.
- PNL Mahdia logo link added to mobile `Navbar` mobile menu section.

### Removed
- Residual Cloudflare deployment files: `wrangler.toml`, `open-next.config.ts`, `opennext.config.ts` — cleaned from the repository.
- Cloudflare-specific middleware hacks that caused blank screen regression on local dev.

---

## [2.0.0] — "Intelligence & Inclusion" — 2026-02-23

### Added
- 🧠 **AI Documentation Layer** — Groq Llama 4 Scout 17B integration via `/api/generate`. One-click auto-fill for project titles and descriptions, translated into EN / FR / AR simultaneously.
- 🔁 **Per-Step AI Translation** — `/api/translate-step` endpoint with smart source-language detection; translates individual tutorial steps independently.
- 🌐 **Release Notes Modal** — In-app changelog shown to users on first visit after a version bump.
- 🏷️ **Hero Version Badge** — Displays the current version prominently on the home page.
- 🤖 **Footer AI Badge** — Shows the AI provider powering the platform.
- 💬 **Comments System** — Real-time project discussion threads; public users can like, admins can delete.
- 🏛️ **Admin Comment Feed** — Dedicated view for admins to monitor recent comments across all projects.
- 📝 **Rich Text Editor** — Markdown support with code block rendering, applied per step.
- ☁️ **Supabase Storage Uploads** — File uploader for `.ino` Arduino code files and `.stl` 3D model files.
- 👤 **Invitation System** — Club Leaders can be onboarded by admins without exposing admin credentials.
- 🖋️ **Geist Mono Font** — Updated project font for better code legibility.

### Changed
- Full RTL layout support for Arabic across all pages, forms, inputs, and modals.
- Resource download section redesigned with color-coded type cards (Blue for code, Orange for models).
- About page completely rewritten with mission, story, and sponsor sections.
- Project detail page polished with improved layout and share button.

---

## [1.0.0] — Initial Release — 2026-02-02

### Added
- 🌐 **Multilingual support**: English (EN), French (FR) and Arabic (AR) with `next-intl` locale routing.
- 🗂️ **Public Project Gallery** with search and category filters (Robotics, IoT, Sensors, Automation, Fundamentals).
- 📖 **Project Detail Pages** with step-by-step guides.
- 🛡️ **Admin Dashboard** — Secure School Leader portal (Create, Edit, Delete projects).
- 🍔 **Responsive Navbar** with language switcher, authentication status, and PNL Mahdia branding.
- 🔐 **Supabase Auth** — SSR session management with middleware.
- 🗄️ **Database Schema** — `projects`, `project_steps`, `profiles`, `attachments`, `comments`, `comment_likes` tables.
- 📋 **Footer** with platform links, organization info, and sponsor section.
