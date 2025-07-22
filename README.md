# 🥗 MealSnap

A full-stack Nuxt 3 web app to help users track meals, analyze nutrition, and set daily macro goals.  
Built with Supabase, Vuetify, and love.

---

## ✨ Features

- 🔐 Authentication & Authorization (Supabase)
- 📸 Meal Analysis via AI-powered image classification
- 🍱 Meal Tracking with calories, macros, and timestamps
- 🎯 Daily Macro Goals (protein, carbs, fats)
- 🧹 Linting and formatting with ESLint & Prettier
- 🚀 Deployable to Vercel, Netlify, or any Node-compatible host

---

## 📦 Tech Stack

- **Frontend**: Nuxt 3 + Vuetify 3
- **Backend**: Nuxt Server API routes
- **Auth & DB**: Supabase (PostgreSQL, Auth, Storage)
- **AI Inference**: To be integrated (browser model or API)
- **Dev Tools**: ESLint + Prettier

---

## 🛠️ Setup Instructions

```bash
# 1. Clone the project
git clone https://github.com/your-username/ai-meal-tracker.git
cd ai-meal-tracker

# 2. Install dependencies
npm install

# 3. Add environment variables
cp .env.example .env
# Fill in your Supabase keys

# 4. Start development server
npm run dev
```

---

## 📂 Environment Variables

Create a `.env` file:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

These are exposed as public runtime config in `nuxt.config.ts`.

---

## 🧪 Lint & Format

Run lint checks and fix issues automatically:

```bash
# Lint code
npm run lint

# Format code with Prettier
npm run format
```

---

## 🚀 Deployment

Deploy to any of the following platforms:

- [Vercel](https://vercel.com/)
- [Netlify](https://netlify.com/)
- AWS, Render, or Docker

Most platforms support Nuxt 3 out of the box.

---

## 🧠 Future Improvements

- Upload meal photos and run AI classification
- Generate nutrition estimates automatically
- Chart macros over time
- Add push notifications/reminders
- Mobile-first PWA setup

---

## 🧑‍💻 Author

Built by [Mert Aksehirlioglu](mailto:mertaksehirlioglu@hotmail.com)  
Feel free to fork, clone, and build on top!

---

## 📜 License

MIT — use it freely for personal or commercial projects.
