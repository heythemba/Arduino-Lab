# 🤖 ArduinoLab v2.5.8

**ArduinoLab** is an AI-assisted, multilingual documentation hub for Arduino & robotics school clubs. Born from the need to preserve transient classroom experiments, it gives students a permanent digital library — and club leaders a zero-friction publishing workflow powered by AI.

> **"Building the Future, One Bot at a Time."**

---

## 🚀 What's New in v2.5.8 — "Libraries & Formatting"

| Feature | Description |
|---|---|
| 📦 **Arduino Libraries** | Added support for attaching `.zip` Arduino libraries to projects (up to 100MB). |
| 📝 **Fundamental Formatting** | Maintained line breaks and text formatting for Fundamental category guides. |
| 🔗 **Clearer Resource Icons** | Restyled buttons to clearly differentiate direct file downloads from external links. |

---

## 🚀 What's New in v2.2.6 — "AI Templates & Localization"

| Feature | Description |
|---|---|
| 🤖 **AI Base Templates** | One-click generation of project base structures to jumpstart documentation |
| 🌍 **Translated Categories** | Project categories (Robotics, IoT, etc.) now correctly translate based on user locale |

---

## 🚀 What's New in v2.0.4 — "Step Layout"

| Change | Description |
|---|---|
| 📐 **Single-Side Timeline** | All steps pinned to the start edge (left in EN/FR, right in AR) — cards now fill ~85% width instead of 50% |

---

## 🚀 What's New in v2.0.3 — "Slug Validation"

| Fix | Description |
|---|---|
| 🔤 **Slug Input Control** | Enforces `a-z` + hyphens only, no spaces, max 20 characters with a live counter |

---

## 🚀 What's New in v2.0.2 — "Quality of Life"

| Fix | Description |
|---|---|
| 🐛 **Login Redirect** | Fixed a bug where successful login kept users on the home screen instead of redirecting to the dashboard |
| 👥 **User Roles** | Replaced generic "Leader" role with two specific roles: **Volunteer Facilitator** and **Teacher** (same permissions, proper identity) |
| 🗄️ **Supabase Migration** | New migration file updates the `profiles` table constraint and trigger to accept the new roles |
| ✉️ **Invitation Button** | "Add Leader" button now correctly reads from i18n and shows "Add New Member" in all languages |
| 🖱️ **Cursor Fix** | Restored `cursor: pointer` globally — buttons and links now show the hand cursor (Tailwind Preflight had reset it) |
| 🔑 **Password Visibility** | Added 👁 eye-toggle to password fields on login and the new user creation form |
| 🔗 **Footer Links** | Moved LinkedIn and Dribbble social icons from the Brand column to the Support column where they belong |
| 🌐 **Locale-Aware Redirect** | Post-login redirect now respects the active language (e.g. `/fr/admin`, `/ar/admin`) |

---

## 🚀 What's New in v2.0.1 — "i18n Completeness"

| Fix | Description |
|---|---|
| 🌍 **Full UI Translation** | All remaining hardcoded English strings translated: Project Card button, Comment sort, Resource headers, "Back to Gallery" |
| 📱 **Mobile PNL Link** | PNL Mahdia logo link now appears in the mobile hamburger menu |
| 🐛 **Blank Screen Fix** | Reverted Cloudflare middleware hack that caused blank screen regression on local dev |
| 🧹 **Repo Cleanup** | Removed residual Cloudflare deployment config files from the project root |

---

## 🚀 What's New in v2.0.0 — "Intelligence & Inclusion"

| Feature | Description |
|---|---|
| 🧠 **AI Documentation** | Groq Llama 4 Scout auto-expands project briefs and translates across EN/FR/AR in one click |
| 🌐 **Full i18n + RTL** | Complete Arabic RTL layout engine — every form, input, and page |
| 📦 **The Maker's Vault** | `.ino` and `.STL` file uploads with Supabase Storage |
| 👥 **Invitation System** | Secure Club Leader onboarding without admin access exposure |
| ✍️ **Rich Text Editor** | Markdown support, code snippets, and per-step AI translation buttons |
| 💬 **Comment System** | Real-time project discussions for students and teachers |

---

## ✨ All Features (v1.0 → v2.0)

- **🌐 Multilingual**: EN, FR, AR with RTL layout engine
- **🧠 AI Auto-Fill**: Generate titles + descriptions from a brief summary, translated instantly
- **🔁 Per-Step Translation**: Translate individual step content with smart source-language detection
- **📂 Project Documentation**: Step-by-step guides with Rich Text Editor (Markdown + code blocks)
- **📥 Resource Downloads**: Organized sections for `.ino` code and `.stl` 3D models
- **🛡️ Admin Dashboard**: Secure area for School Leaders (Create, Edit, Delete)
- **☁️ Supabase Storage**: Seamless file uploads for images, code, and models
- **💬 Comments**: Real-time discussion threads per project
- **🏷️ Categories**: Robotics, IoT, Sensors, Automation, Fundamentals (simplified layout)
- **📱 Responsive**: Mobile-first, modern UI with Tailwind CSS

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) + [Lucide Icons](https://lucide.dev/) |
| Backend & Auth | [Supabase](https://supabase.com/) (PostgreSQL + GoTrue) |
| Internationalization | [next-intl](https://next-intl-docs.vercel.app/) |
| AI | [Groq](https://groq.com/) — Llama 4 Scout 17B via OpenAI-compatible SDK |
| Deployment | [Vercel](https://vercel.com/) |

---

## 🏁 Getting Started

### Prerequisites
- Node.js 18+
- A Supabase Project
- A [Groq API Key](https://console.groq.com/keys) (free tier available)

### 1. Clone the Repository

```bash
git clone https://github.com/heythemba/Arduino-Lab.git
cd Arduino-Lab
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GROQ_API_KEY=your_groq_api_key
```

### 4. Database Setup

Run the SQL scripts in your Supabase SQL Editor:
- `supabase_schema.sql` — Core tables (projects, project_steps, profiles)
- `supabase_comments_migration.sql` — Comments system
- `supabase_attachments_migration.sql` — File attachments

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## 📂 Project Structure

```
src/
├── app/
│   ├── [locale]/          # Localized routes (en/fr/ar)
│   │   ├── admin/         # Dashboard & Project Editor
│   │   ├── login/         # Auth pages
│   │   └── projects/      # Public Gallery & Project Details
│   ├── auth/              # Supabase Auth Callbacks
│   └── api/
│       ├── generate/      # AI project brief → multilingual content
│       └── translate-step/ # Per-step smart translation
├── components/
│   ├── admin/             # ProjectForm, FileUploader, etc.
│   ├── comments/          # Comment system components
│   └── ui/                # Button, RichTextEditor, etc.
├── lib/                   # Supabase client, API helpers
├── messages/              # i18n JSON (en.json, fr.json, ar.json)
└── middleware.ts           # Auth & Locale routing
```

---

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License.

---

<p align="center">
  Powered by <strong>AI & PNL Volunteers</strong> · Built with ❤️ by <strong>Haythem Baganna</strong> for the Future Engineers of Tunisia.
</p>
