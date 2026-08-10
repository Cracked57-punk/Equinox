# Equinox — Round 2 Portal

Live team-contest platform for Enigma's Round 2. Built for real-time exam administration with a JEE-style interface, automatic scoring, and a secure live leaderboard.

---

## 🏗️ Architecture & Technologies Used

Equinox is built on a modern, full-stack React framework optimized for speed, security, and developer experience. 

### 1. The Core Framework: Next.js 15 (App Router) & TypeScript
- **Why?** Next.js allows us to write both the Frontend (UI) and the Backend (API and Database logic) in the exact same repository using TypeScript. The App Router (`src/app`) natively supports React Server Components, meaning we can fetch database scores securely on the server without sending bloated JavaScript to the client.
- **Language:** TypeScript ensures strict typing (e.g., catching bugs where a `Team` object is missing an `email` field) before the code even compiles.

### 2. The Backend (Database & ORM): PostgreSQL & Prisma
- **Why?** PostgreSQL is an ultra-reliable relational database. Because we are dealing with high-stakes exam submissions and live leaderboards, we need atomic transactions (ensuring a score is calculated perfectly without race conditions). 
- **Prisma:** Acts as our ORM (Object-Relational Mapper). Instead of writing raw SQL strings that are prone to errors, we interact with the database using strongly-typed JavaScript methods.

### 3. The Frontend (Styling): Tailwind CSS
- **Why?** Tailwind allows us to rapidly build the JEE-style interface and the dark-themed leaderboard without leaving our component files. It keeps the CSS bundle incredibly small by purging unused styles in production.

### 4. Authentication: Stateless JWTs & Passwordless Magic Links
- **Why?** Traditional username/password systems are difficult for contestants during a high-pressure event. We implemented a Passwordless Magic Link system (via the Resend API). The session is stored securely in an encrypted browser cookie (JWT), meaning the database doesn't have to look up a session ID on every single request, drastically reducing server load.

---

## 📁 Optimal Folder Structure

The project is deliberately structured following the absolute best practices of the Next.js App Router. This keeps the codebase highly predictable and easy to read for any developer.

```text
Equinox/
├── prisma/                 # Database schema and seed scripts
│   ├── schema.prisma       # The absolute source of truth for our database tables
│   └── seed.js             # Script to populate dummy teams and settings for testing
├── public/                 # Static assets (images, fonts, favicons)
├── src/                    # All application source code
│   ├── actions/            # Server Actions (Backend Logic)
│   │   ├── admin/          # Code for modifying Round Settings, starting the exam, etc.
│   │   ├── auth/           # Code for Magic Links and Admin login verification
│   │   └── exam.ts         # The core scoring engine and Fisher-Yates shuffling logic
│   ├── app/                # The Routing Layer (URLs)
│   │   ├── admin/          # Everything under /admin (Protected by Admin Auth)
│   │   ├── api/            # REST API endpoints (e.g., for Google Sheets import)
│   │   ├── exam/           # The contestant interface (Protected by Team Auth)
│   │   └── login/          # Public login page
│   ├── components/         # Reusable UI building blocks (Client & Server components)
│   │   ├── admin/          # Admin Dashboard, Sidebar, Leaderboard tables
│   │   ├── shared/         # Things used everywhere (like the LiveRefresh poller)
│   │   └── team/           # The complex JEE Exam Client interface
│   ├── lib/                # Shared utilities and configuration
│   │   ├── auth/           # Session cookie encryption and JWT verification
│   │   ├── email.ts        # The Resend API wrapper
│   │   └── prisma.ts       # The global database client singleton
│   └── types/              # Global TypeScript definitions
```

---

## 🚀 Setup & Deployment

1. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

2. **Configure Environment**
   Duplicate `.env.example` to `.env` and fill in your PostgreSQL URL, Resend API key, and Auth Secret.

3. **Push the Schema**
   \`\`\`bash
   npx prisma db push
   \`\`\`

4. **Run the Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Deploying for the Event (Step 12)**
   To deploy this for the live event, connect your GitHub repository directly to [Vercel](https://vercel.com/). Vercel natively understands Next.js and will automatically build and host the frontend and backend together on edge networks, ensuring ultra-low latency for the contestants.
