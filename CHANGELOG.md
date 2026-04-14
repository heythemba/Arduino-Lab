# Changelog

All notable changes to **ArduinoLab** are documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) conventions.

---

## [2.7.5] — PDF Generator Overhaul — 2026-04-14

### Added
- 📄 **@react-pdf/renderer Migration**: Fully replaced `html2canvas` + `jsPDF` with `@react-pdf/renderer` for text-layer rich, vector-based PDFs with proper multilingual support (EN/FR/AR).
- 🔤 **Arduino Code Formatter**: Code snippets in the PDF are now automatically formatted — line breaks are inserted after `{`, before `}`, after `;`, and before `#` directives.

### Fixed
- 🌍 **Arabic PDF Crash**: Resolved `Cannot read properties of undefined (reading 'id')` crash when generating PDFs in Arabic. Root cause was the font CDN serving a subsetted TTF missing GSUB ligature tables required for Arabic shaping. Fixed by loading full un-subsetted `NotoSansArabic-Regular.ttf` from the official Google Fonts GitHub repository.
- 🔒 **CSP Blocking PDF Engine**: Fixed Content Security Policy to allow `data:` URIs (WASM layout engine), `cdn.jsdelivr.net` (font CDN), `i.ibb.co` and `iili.io` (image hosts) in `connect-src` and `font-src`.
- 🔗 **Font File 404**: Fixed `.ttf` files returning 404 by adding `ttf|woff|woff2` extensions to the middleware matcher exclusion list, preventing locale rewriting from intercepting static font requests.
- 🖼️ **Navbar Performance**: Added missing `sizes` prop to both PNL logo `<Image>` components (desktop & mobile) to suppress Next.js performance warning.

---

## [2.7.4] — Image Hosting — 2026-04-14

### Changed
- 🚀 **Zero-Cost Image Hosting**: Migrated image hosting backend from FreeImage.host to Imagebb to resolve service stability issues and prevent image deletion.

---

## [2.7.3] — Editor & UI Cleanup — 2026-04-11

### Improved
- ✏️ **RichTextEditor Toolbar**: Refactored all toolbar buttons into a reusable `ToolButton` component with hover tooltips for better UX and cleaner code.
- 🔧 **StarterKit Config**: Fixed extension conflict by explicitly disabling built-in `link` and `underline` from StarterKit to avoid duplicate registration with standalone extensions.
- 🧹 **Settings Form Cleanup**: Removed unused/dead code from `SettingsForm.tsx`.
- 💬 **About & Admin Pages**: Minor layout and content updates.

---

## [2.7.2] — Polish & Fixes — 2026-04-11

### Added
- 📊 **Vercel Analytics CSP**: Added `va.vercel-scripts.com` to `script-src` and `connect-src` so Vercel Analytics work correctly in production.
- 🇫🇷 **French i18n**: Added missing `backToGallery`, `sortRecent`, and `sortLiked` translation keys to `fr.json`.

### Improved
- 📄 **PDF Export**: Rebuilt as canvas-based renderer (`html2canvas` + `jsPDF`) with proper multi-page support and aspect-ratio scaling.
- 🔄 **Step Translation Merge**: Translation results now correctly merge without overwriting already-filled languages; added guard when no source language exists.
- 💬 **Comment HTML Rendering**: `commentParser` now detects and safely renders Tiptap HTML content via `html-react-parser` + `sanitizeHtml`.

---

## [2.7.1] — PDF Export — 2026-04-10

### Added
- 📄 **PDF Export Button**: Users can now download any project as a PDF directly from the project detail page, including all step titles and content.
- 🌐 **i18n Labels**: Added `downloadPdf` translation key to EN, FR, and AR locale files.

---

## [2.7.0] — Rich Text & AI Enhancements — 2026-04-10

### Added
- 📝 **Tiptap Rich Text Editor**: Replaced standard textareas with a full WYSIWYG editor for project steps, allowing live formatting for Bold, Italics, Lists, Code Hooks, and Links.
- ⏳ **AI Translation Overlay**: Added a dedicated, full-screen loading overlay when translating large project steps.

### Fixed
- 🐛 **URL Validation Crash**: Fixed a strict Zod validation bug (`image_url`) that caused the server to silently reject project saves if a step was missing an image.
- 🎨 **Tailwind Editor Styling**: Re-mapped Tailwind list and link variables to raw CSS selectors to ensure bullet points and styles render correctly inside the editor without depending on the heavy typography plugin.
- ⏱️ **Translation API Stability**: Increased token limit to `4096` and Serverless execution duration to `60` seconds to securely process extremely long Markdown steps.
- 🧹 **SEO Component**: Removed `DOMPurify` from JSON-LD to prevent stripping brackets and crashing Turbopack during SSR.

---

## [2.6.0] — Storage & UI Refinements — 2026-04-09

### Added
- 🚀 **Zero-Cost Image Hosting**: Replaced Supabase Storage for images with the FreeImage.host API to eliminate storage costs.
- 🔒 **Secure Upload Proxy**: Added `/api/upload-image` edge route to securely proxy uploads without leaking API keys to the client.
- 🖼️ **ImageUploader Component**: New drag-and-drop uploader with live preview, animated success toast, and automatic base64 encoding.
- ⚡ **Skeleton Loaders**: Implemented `loading.tsx` skeleton states globally for Home, Admin Dashboard, Settings, Create/Edit Project, and About pages.
- 🔓 **Relaxed CSP**: Broadened `img-src` Content Security Policy in middleware to allow external HTTPS images (fixes legacy images from Google/Medium).
- 🌐 **Navbar UI**: Added `LogIn`, `LogOut`, and `Globe` icons to Navbar buttons with glassmorphic styling on the active language dropdown.

### Changed
- **Hero Section**: Reduced excess top padding space and applied strict brand coloring (`#2463eb`) to the "Arduino" prefix in "ArduinoLab".
- **Gallery Spacing**: Increased the gap below search filters to `96px` (`mb-24`) for a cleaner breathing room between search and results.
- **Form Props**: Completely removed `imageUploadUrl` prop injection from all pages since `ImageUploader` inherently wraps the secure proxy.

---
## [2.5.8] — Libraries & Formatting — 2026-02-25

### Added
- 📦 **Arduino Libraries**: Added support for uploading `.zip` Arduino libraries (up to 100MB) as project resources.
- 🔗 **Resource Icons**: Downloadable files now correctly display a Download icon, while external links display an External Link icon.

### Fixed
- 📝 **Fundamental Steps**: Preserved whitespace and line breaks when pasting text into Fundamental category projects.

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
