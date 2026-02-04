
# 🤖 ArduinoLab

**ArduinoLab** is a centralized open-source platform designed to preserve and showcase the incredible robotics projects created by school clubs and students. Born from the need to document transient classroom experiments, it serves as a permanent digital library for the next generation of engineers.

![ArduinoLab Hero](/public/hero-screenshot.png)

## 🚀 Mission

> **"Building the Future, One Bot at a Time."**

Our goal is to ensure that no innovative idea is lost. We provide students with a platform to:
- **Document** their projects with step-by-step guides.
- **Share** open-source code (`.ino`) and 3D models (`.stl`).
- **Inspire** others by building a searchable, multilingual gallery of Tunisian youth creativity.

## ✨ Key Features

- **🌐 Multilingual Support**: Fully localized in **English, French, and Arabic** (RTL support included).
- **📂 Project Documentation**: Rich text editor for "Step-by-Step" guides, code snippets, and image galleries.
- **📥 Resource Downloads**: Dedicated sections for downloading source code and 3D printing files.
- **🛡️ Admin Dashboard**: Secure area for School Leaders to manage their projects (Create, Edit, Delete).
- **☁️ Cloud Storage**: Seamless file uploads (Images, Code, Models) powered by Supabase Storage.
- **📱 Responsive Design**: A modern, mobile-friendly interface built with Tailwind CSS.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Lucide Icons](https://lucide.dev/)
- **Backend & Auth**: [Supabase](https://supabase.com/) (PostgreSQL + GoTrue)
- **Internationalization**: [next-intl](https://next-intl-docs.vercel.app/)
- **Forms**: Server Actions + Zod (implied validation logic)

## 🏁 Getting Started

### Prerequisites

- Node.js 18+
- A Supabase Project

### 1. Clone the Repository

```bash
git clone https://github.com/heythemba/arduino-lab.git
cd arduino-lab
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
```

### 4. Database Setup

Run the SQL scripts provided in the `migrations/` folder (or root) in your Supabase SQL Editor to verify tables:
- `projects`
- `project_steps`
- `project_attachments`
- `profiles`

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📂 Project Structure

```
src/
├── app/
│   ├── [locale]/          # Localized routes (en/fr/ar)
│   │   ├── admin/         # Dashboard & Editor
│   │   ├── login/         # Auth pages
│   │   └── projects/      # Public Gallery & Details
│   ├── auth/              # Auth Callbacks
│   └── api/               # API Routes (if any)
├── components/            # Reusable UI Components
├── lib/                   # Utilities (Supabase client, etc.)
├── messages/              # i18n Translation Files (JSON)
└── middleware.ts          # Auth & Locale Middleware
```

## 🤝 Contributing

We welcome contributions from students and teachers!
1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Developed with ❤️ by <strong>Haythem Baganna</strong> for the Future Engineers of Tunisia.
</p>
