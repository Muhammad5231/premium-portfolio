# Architectural Portfolio & Editorial CMS

A production-grade personal portfolio, editorial publication platform, and administrative Content Management System (CMS). Built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, and **MongoDB / Mongoose**.

Designed as a bespoke digital identity for creative developers, design engineers, and systems architects. Eschews generic templates, neon glows, and 3D bloat in favor of intentional typographic hierarchy, spatial stillness, tactile feedback, and radical engineering discipline.

---

## Key Features

### Public Experience
- **Radical Editorial Typography**: Modernist layout inspired by classic Swiss design, geometric grid canons, and sub-pixel optical controls.
- **Dark / Light Theme System**:
  - **Dark Theme**: Deep obsidian `#0c0d10`, soft off-white typography, basalt surfaces, hairline borders, and warm architectural amber accents `#dca54c`.
  - **Light Theme**: Warm archival alabaster paper `#f8f7f4`, deep charcoal ink `#121316`, crisp white cards, warm graphite borders, and high-contrast ochre accents `#b47820`.
  - **Zero FOUC**: Synchronous blocking inline script prevents flash of unstyled theme on initial load.
  - **Persistence & Auto-detection**: Remembers user choice in `localStorage` and automatically respects `prefers-color-scheme`.
- **Editorial Blog & Monographs (`/blog` & `/blog/[slug]`)**:
  - Long-form markdown monographs with code syntax highlighting and table of contents.
  - Real-time reading progress indicator bar.
  - Active scrollspy table of contents extracted automatically from headings.
  - Social share buttons (X/Twitter, LinkedIn, Copy link with feedback).
  - Search with debouncing, category taxonomy, and tag filtering.
- **Authenticated Community & Comments (`/blog/[slug]#comments`)**:
  - Nested two-tier discussion tree with official editorial badge for author replies.
  - Inviting sign-in / registration modal callback for unauthenticated guests.
  - Comment moderation pipeline (`pending`, `approved`, `rejected`).
- **Threaded Contact & Client Inquiries (`/messages` & `/messages/[id]`)**:
  - Authenticated inquiry brief submission (timeline, budget, scope).
  - Bidirectional threaded chat dialogue between prospective client and studio.
  - Dual-writes to conversation and legacy message collections for backwards compatibility.
- **User Notification Center (`/notifications` & Navigation Dropdown)**:
  - Live animated unread badge counter in desktop header and mobile drawer.
  - Dropdown panel for quick review and dedicated notification dashboard with category filters (`Comments`, `Messages`, `System`).
  - Single-click mark as read and bulk "Mark all as read".
- **Archival Gallery Showcase (`/gallery`)**:
  - Responsive masonry grid with category filters, specimen metadata badges, and smooth lightbox modal inspection.

### Administrative CMS (`/admin`)
- **Fixed Viewport Docking**: Left sidebar stays permanently docked to the viewport and never scrolls away when content scrolls. Main content scrolls independently.
- **Responsive Drawer**: Transforms into a slide-out drawer with backdrop on tablet and mobile viewports.
- **Theme Scope Isolation**: Admin interface remains locked to its dark terminal styling even if the public site is toggled to light mode.
- **Monograph Publishing**: Markdown editor with custom formatting toolbar (H2, H3, Bold, Italic, Quotes, Code, Specimen image), write/preview tabs, SEO metadata, and media picker integration.
- **Comment Moderation**: Approve, reject, or purge comments; dispatch official editorial replies directly to comment threads with automated user notifications.
- **Threaded Message Center (`/admin/messages`)**: Full client inquiry timeline, budget telemetry, dialogue responder, and status toggles (`OPEN`, `CLOSED`, `ARCHIVED`).
- **Member Directory (`/admin/users`)**: Search registered members, monitor engagement activity (comment and conversation counts), and toggle instant **Account Status Suspension / Activation**.
- **Self-Hosted Media Vault**: Built-in media library with MIME validation, file integrity verification, and local filesystem storage under `/public/uploads/`.
- **System Settings & Navigation**: Control public menu links, global SEO titles, meta descriptions, and footer statements dynamically from MongoDB.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router, Server Components, Route Handlers) |
| **Language** | TypeScript 5 (Strict Mode) |
| **Styling** | Tailwind CSS 3 (CSS variables with dynamic alpha-value modifiers) |
| **Animations** | Framer Motion & CSS hardware-accelerated transforms |
| **Database** | MongoDB & Mongoose ODM |
| **Authentication** | Stateless HTTP-only signed JWT cookies (`jose`) + `bcryptjs` (12 salt rounds) |
| **Validation** | Zod schemas |
| **Icons** | Lucide React |

---

## Prerequisites

- **Node.js**: `v18.17.0` or higher (tested with `v20` and `v24`)
- **MongoDB**: A running MongoDB instance:
  - **Local Development**: `mongodb://127.0.0.1:27017/portfolio` (Community Server or Docker)
  - **Production**: MongoDB Atlas cluster URI (`mongodb+srv://...`)
- **npm** or **pnpm** / **yarn**

---

## Quick Start (Local Setup)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/personal-portfolio-cms.git
cd personal-portfolio-cms
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file by copying `.env.example`:
```bash
cp .env.example .env.local
```

Populate `.env.local` with your local settings:
```env
# Local MongoDB connection
MONGODB_URI=mongodb://127.0.0.1:27017/portfolio

# Authentication secret (32+ random characters)
AUTH_SECRET=development_secret_key_change_in_production_32_chars_min

# Canonical application URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Seed Database & Initial Admin Account
Run the automated seed script to populate the database with case studies, career experience, capabilities, gallery plates, blog monographs, categories, navigation links, and the default superadmin:
```bash
npm run seed
```

**Default Admin Credentials:**
- **Email**: `admin@portfolio.local`
- **Password**: `admin123`

*(You can update your credentials, profile, or name directly inside the Admin CMS after logging in).*

### 5. Start Development Server
```bash
npm run dev
```

Open your browser:
- **Public Website**: [http://localhost:3000](http://localhost:3000)
- **Blog Section**: [http://localhost:3000/blog](http://localhost:3000/blog)
- **Gallery Showcase**: [http://localhost:3000/gallery](http://localhost:3000/gallery)
- **Admin Control Console**: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## Environment Variables Reference

| Variable | Required | Description | Example |
|---|---|---|---|
| `MONGODB_URI` | **Yes** | Connection string for MongoDB database | `mongodb://127.0.0.1:27017/portfolio` (local) or `mongodb+srv://...` (Atlas) |
| `AUTH_SECRET` | **Yes** | Cryptographic key used to sign session JWT tokens (min. 32 characters) | `e9f8a3c1...` |
| `NEXT_PUBLIC_SITE_URL`| No | Canonical base URL used for OpenGraph metadata and links | `http://localhost:3000` or `https://yourdomain.com` |
| `NODE_ENV` | Automatic | Environment mode (`development` or `production`) | `production` |

> **Security Note**: Never commit `.env`, `.env.local`, or any credentials to Git. Ensure `.env.local` is present in `.gitignore`.

---

## MongoDB Configuration

### Local Development
Ensure your local MongoDB daemon is running:
```bash
# MacOS (Homebrew)
brew services start mongodb-community

# Linux (systemd)
sudo systemctl start mongod

# Docker
docker run -d -p 27017:27017 --name mongo-portfolio mongo:latest
```

### Production (MongoDB Atlas)
1. Create a free or dedicated cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Under **Database Access**, create a database user with read and write privileges.
3. Under **Network Access**, add your server's IP address (or `0.0.0.0/0` for serverless hosts like Vercel).
4. Retrieve the connection string:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/portfolio?retryWrites=true&w=majority
   ```

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts Next.js development server with hot reload |
| `npm run build` | Compiles and optimizes application for production |
| `npm run start` | Starts production server using compiled build |
| `npm run typecheck` | Executes TypeScript compiler check (`tsc --noEmit`) |
| `npm run lint` | Runs Next.js ESLint rules and code checks |
| `npm run seed` | Seeds database with initial profile, monographs, and admin |

---

## Production Deployment

### 1. Build Verification
Before deploying, ensure all types and builds compile cleanly:
```bash
npm run typecheck
npm run lint
npm run build
```

### 2. Deployment on Vercel / Node.js Host
1. Push the repository to GitHub.
2. Import the repository into [Vercel](https://vercel.com) (or your preferred container host).
3. Configure the **Environment Variables** in the dashboard:
   - `MONGODB_URI`
   - `AUTH_SECRET`
   - `NEXT_PUBLIC_SITE_URL`
4. Deploy. Next.js will automatically run `npm run build` and output the production build.
5. On first launch, run `npm run seed` once against your production database to initialize the schema and superadmin account.

---

## Security Architecture

- **Dual Session Cookie Architecture**: Independent HTTP-only, SameSite, Secure signed cookies for users (`portfolio_user_token`) and administration (`portfolio_admin_token`), preventing cross-privilege collision.
- **Edge Route Protection**: Centralized Next.js middleware guards `/admin/*`, `/api/admin/*`, and member areas (`/profile`, `/messages`, `/notifications`).
- **Password Hashing**: Passwords stored using `bcryptjs` with 12 salt rounds; plain-text passwords never stored or logged.
- **Account Suspension**: Suspended members are blocked at authentication and middleware layers immediately.
- **Input Sanitization**: All mutating API endpoints validate payloads with strict Zod schemas to protect against injection attacks.

---

## License

MIT &copy; 2026. Designed and engineered for high-craft digital experiences.
