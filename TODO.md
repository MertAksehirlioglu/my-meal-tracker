# TODOs for MealSnap

---

## 🟦 User Authentication & Authorization
- [ ] [P1] Integrate Supabase Auth with Nuxt
  - [ ] Add login, registration, and password reset flows
    - [ ] User can register with email/password
    - [ ] Error shown for duplicate email
    - [ ] Redirect to dashboard on success
  - [ ] Implement protected routes/pages
  - [ ] Add user profile and settings page
  - [ ] Write unit tests for auth flows

---

## 🟩 Image Storage Setup
- [ ] [P1] Set up Supabase Storage for meal images
  - [ ] Allow users to upload meal photos
  - [ ] Display uploaded images in meal logs
  - [ ] Handle image deletion and cleanup
  - [ ] Manual test: Upload and delete image from mobile device

---

## 🟧 Meal Database Setup
- [ ] [P1] Design PostgreSQL schema for meals & users
- [ ] [P1] Connect Nuxt API routes to Supabase database
- [ ] [P1] Implement CRUD operations for meals
- [ ] [P2] Write unit tests for meal CRUD API
- [ ] [P2] Add daily user goals tracking

---

## 🟨 Analysis Pipeline Setup
- [ ] [P2] Integrate AI model or API for meal image analysis
  - [ ] Process uploaded images and return nutrition estimates
  - [ ] Store analysis results in the database
  - [ ] Display nutrition breakdown in the UI

---

## UI Tasks
- [ ] [P1] Main Page: Daily calorie intake display
  - [ ] Fetch user’s daily calorie goal from DB
  - [ ] Show progress bar for calories/macros
  - [ ] Add UI for updating goals
- [ ] [P2] Meal Details View
  - [ ] Manually add a meal to the database
  - [ ] Add meal by photo, prefill nutrition values
- [ ] [P1] Login Page
  - [ ] Email/password login
  - [ ] Error handling for invalid credentials
- [ ] [P1] Register Page
  - [ ] User registration with validation
  - [ ] Redirect to dashboard on success
- [ ] [P3] Forgot Password Page
- [ ] [P3] Contact Page
- [ ] [P3] About Page
- [ ] [P3] Privacy Policy Page
- [ ] [P3] Terms of Service Page
- [ ] [P3] FAQ Page
- [ ] [P3] Blog Page
- [ ] [P1] Accessibility: Ensure all forms have labels and ARIA attributes
- [ ] [P1] Mobile: Test all pages on iOS/Android

---

## Deployment & Monitoring
- [ ] [P1] Set up Vercel/Netlify deployment
- [ ] [P2] Integrate Sentry for error tracking
- [ ] [P2] Add Google Analytics

---

## User Feedback Loop
- [ ] [P2] Add feedback form/modal
- [ ] [P2] Set up email notifications for new feedback

---

## 🧠 Future Improvements
- [ ] Chart macros over time
- [ ] Add push notifications/reminders
- [ ] Mobile-first PWA setup

---

*Add new tasks below as your project grows!*


---
