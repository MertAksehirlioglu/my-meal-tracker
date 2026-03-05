<template>
  <v-app class="landing-root">

    <!-- ── Navbar ─────────────────────────────────────────── -->
    <header class="nav">
      <div class="nav-inner">
        <div class="nav-brand">
          <span class="brand-mark">🍽</span>
          <span class="brand-name">MealSnap</span>
        </div>
        <div class="nav-links">
          <button class="nav-btn" @click="goToLoginPage">Log in</button>
        </div>
      </div>
    </header>

    <!-- ── Hero ───────────────────────────────────────────── -->
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-eyebrow">AI-powered nutrition tracker</div>
        <h1 class="hero-heading">
          Track every bite.<br />
          <em>Know every macro.</em>
        </h1>
        <p class="hero-sub">
          Snap a photo of your meal — AI identifies the food, calculates the
          nutrition, and logs it instantly. No manual entry.
        </p>
        <div class="hero-actions">
          <button class="btn-primary" @click="goToLoginPage">Try the Demo</button>
          <a
            class="btn-text"
            href="https://github.com/MertAksehirlioglu/my-meal-tracker"
            target="_blank"
            rel="noopener"
          >View on GitHub ↗</a>
        </div>
      </div>

      <div class="hero-visual" aria-hidden="true">
        <div class="hero-blob hero-blob--1" />
        <div class="hero-blob hero-blob--2" />
        <div class="hero-plate">🥗</div>
      </div>
    </section>

    <!-- ── How it works ───────────────────────────────────── -->
    <section class="steps-section">
      <div class="section-inner">
        <p class="section-eyebrow">How it works</p>
        <div class="steps-grid">
          <div class="step">
            <div class="step-num">01</div>
            <div class="step-icon">📸</div>
            <h3>Snap</h3>
            <p>Take or upload a photo of any meal — home-cooked, restaurant, or snack.</p>
          </div>
          <div class="step">
            <div class="step-num">02</div>
            <div class="step-icon">🧠</div>
            <h3>Analyze</h3>
            <p>AI identifies every ingredient and calculates calories, protein, carbs, and fat.</p>
          </div>
          <div class="step">
            <div class="step-num">03</div>
            <div class="step-icon">📊</div>
            <h3>Track</h3>
            <p>Watch your macros stack up through the day and measure against your personal goals.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Features + Mock UI ─────────────────────────────── -->
    <section class="features-section">
      <div class="section-inner features-inner">

        <div class="features-text">
          <p class="section-eyebrow">What's included</p>
          <h2>A complete nutrition toolkit</h2>
          <ul class="feature-list">
            <li><span class="check">✓</span> AI meal recognition via photo</li>
            <li><span class="check">✓</span> Custom daily macro goals</li>
            <li><span class="check">✓</span> Meal history & progress charts</li>
            <li><span class="check">✓</span> Multi-device, Firebase-backed</li>
            <li><span class="check">✓</span> Demo mode — no signup needed</li>
          </ul>
        </div>

        <div class="mock-card">
          <div class="mock-header">
            <span class="mock-title">Today's Macros</span>
            <span class="mock-date">Wed, Mar 4</span>
          </div>
          <div class="mock-kcal">1 482 <span>kcal</span></div>
          <div class="macro-bars">
            <div class="macro-row">
              <span class="macro-label">Protein</span>
              <div class="bar-track">
                <div class="bar-fill bar-protein" style="width: 72%" />
              </div>
              <span class="macro-pct">72%</span>
            </div>
            <div class="macro-row">
              <span class="macro-label">Carbs</span>
              <div class="bar-track">
                <div class="bar-fill bar-carbs" style="width: 58%" />
              </div>
              <span class="macro-pct">58%</span>
            </div>
            <div class="macro-row">
              <span class="macro-label">Fat</span>
              <div class="bar-track">
                <div class="bar-fill bar-fat" style="width: 45%" />
              </div>
              <span class="macro-pct">45%</span>
            </div>
          </div>
          <div class="mock-meals">
            <div class="mock-meal">🥑 Avocado Toast <span>342 kcal</span></div>
            <div class="mock-meal">🍗 Grilled Chicken <span>210 kcal</span></div>
            <div class="mock-meal">🥗 Greek Salad <span>180 kcal</span></div>
          </div>
        </div>

      </div>
    </section>

    <!-- ── Portfolio CTA ──────────────────────────────────── -->
    <section class="portfolio-section">
      <div class="section-inner portfolio-inner">
        <span class="portfolio-badge">Portfolio Project</span>
        <h2>Built by Mert Aksehirlioglu</h2>
        <p>New signups are closed. You can explore the live demo or reach out directly.</p>
        <div class="portfolio-actions">
          <button class="btn-primary" @click="goToLoginPage">Open Demo</button>
          <button class="btn-outline" @click="goToContactPage">Get in Touch</button>
        </div>
      </div>
    </section>

  </v-app>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const config = useRuntimeConfig()
const signupDisabled = computed(() => config.public.signupDisabled)

const router = useRouter()
function goToLoginPage() { router.push('/login') }
function goToContactPage() { router.push('/contact') }
</script>

<style scoped>
/* ── Base ───────────────────────────────────────────────── */
.landing-root {
  font-family: 'DM Sans', system-ui, -apple-system, sans-serif !important;
  background: #f9f7f4 !important;
}

/* ── Navbar ──────────────────────────────────────────────── */
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: #1a2e1c;
}

.nav-inner {
  max-width: 1120px;
  margin: 0 auto;
  padding: 18px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-mark { font-size: 20px; }

.brand-name {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 19px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #f5f0e8;
}

.nav-btn {
  background: transparent;
  border: 1px solid rgba(245, 240, 232, 0.28);
  color: rgba(245, 240, 232, 0.85);
  padding: 7px 20px;
  border-radius: 6px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}

.nav-btn:hover {
  border-color: rgba(245, 240, 232, 0.7);
  color: #f5f0e8;
}

/* ── Hero ────────────────────────────────────────────────── */
.hero {
  min-height: 100vh;
  background: #1a2e1c;
  display: flex;
  align-items: center;
  padding: 120px 32px 80px;
  position: relative;
  overflow: hidden;
}

.hero-inner {
  max-width: 580px;
  position: relative;
  z-index: 2;
  margin-left: max(32px, calc(50% - 560px));
}

.hero-eyebrow {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #7cb87f;
  margin-bottom: 28px;
}

.hero-heading {
  font-family: 'Fraunces', Georgia, serif;
  font-size: clamp(44px, 6.5vw, 76px);
  font-weight: 700;
  line-height: 1.06;
  color: #f5f0e8;
  margin: 0 0 28px;
  letter-spacing: -0.025em;
}

.hero-heading em {
  font-style: italic;
  color: #a8d5ab;
}

.hero-sub {
  font-size: 17px;
  line-height: 1.7;
  color: rgba(245, 240, 232, 0.58);
  margin: 0 0 44px;
  max-width: 460px;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

/* Decorative blobs + plate */
.hero-visual {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.hero-blob {
  position: absolute;
  border-radius: 50%;
}

.hero-blob--1 {
  width: 480px;
  height: 480px;
  background: radial-gradient(circle, rgba(44, 95, 46, 0.3) 0%, transparent 70%);
  right: 5%;
  top: 50%;
  transform: translateY(-50%);
}

.hero-blob--2 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(224, 122, 95, 0.18) 0%, transparent 70%);
  right: 18%;
  top: 25%;
}

.hero-plate {
  position: absolute;
  font-size: clamp(90px, 10vw, 140px);
  right: calc(50% - 500px);
  top: 50%;
  transform: translateY(-50%);
  filter: drop-shadow(0 24px 48px rgba(0, 0, 0, 0.35));
}

/* ── Shared section styles ───────────────────────────────── */
.section-inner {
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 32px;
}

.section-eyebrow {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #e07a5f;
  margin-bottom: 20px;
}

/* ── Steps ───────────────────────────────────────────────── */
.steps-section {
  padding: 104px 0;
  background: #f9f7f4;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 52px;
  margin-top: 4px;
}

.step-num {
  font-family: 'Fraunces', serif;
  font-size: 12px;
  font-weight: 700;
  color: #e07a5f;
  letter-spacing: 0.06em;
  margin-bottom: 18px;
}

.step-icon {
  font-size: 30px;
  margin-bottom: 18px;
}

.step h3 {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 22px;
  font-weight: 700;
  color: #1a2e1c;
  margin: 0 0 12px;
  letter-spacing: -0.015em;
}

.step p {
  font-size: 15px;
  line-height: 1.65;
  color: #5a6a5b;
  margin: 0;
}

/* ── Features ────────────────────────────────────────────── */
.features-section {
  padding: 104px 0;
  background: #ffffff;
  border-top: 1px solid #ede9e3;
  border-bottom: 1px solid #ede9e3;
}

.features-inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
}

.features-text h2 {
  font-family: 'Fraunces', Georgia, serif;
  font-size: clamp(28px, 3vw, 40px);
  font-weight: 700;
  color: #1a2e1c;
  margin: 0 0 36px;
  line-height: 1.15;
  letter-spacing: -0.02em;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.feature-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  color: #3a4a3b;
}

.check {
  width: 22px;
  height: 22px;
  background: #1a2e1c;
  color: #a8d5ab;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}

/* ── Mock Card ───────────────────────────────────────────── */
.mock-card {
  background: #1a2e1c;
  border-radius: 18px;
  padding: 28px 30px;
  color: #f5f0e8;
  box-shadow: 0 24px 56px rgba(26, 46, 28, 0.24);
}

.mock-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.mock-title {
  font-family: 'Fraunces', serif;
  font-size: 15px;
  font-weight: 600;
  color: #f5f0e8;
}

.mock-date {
  font-size: 12px;
  color: rgba(245, 240, 232, 0.38);
}

.mock-kcal {
  font-family: 'Fraunces', serif;
  font-size: 36px;
  font-weight: 700;
  color: #f5f0e8;
  margin-bottom: 24px;
  line-height: 1;
}

.mock-kcal span {
  font-size: 16px;
  font-weight: 400;
  color: rgba(245, 240, 232, 0.45);
  margin-left: 4px;
}

.macro-bars {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(245, 240, 232, 0.08);
}

.macro-row {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
}

.macro-label {
  width: 52px;
  flex-shrink: 0;
  color: rgba(245, 240, 232, 0.55);
}

.bar-track {
  flex: 1;
  height: 5px;
  background: rgba(245, 240, 232, 0.08);
  border-radius: 3px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 3px;
}

.bar-protein { background: #7cb87f; }
.bar-carbs   { background: #e07a5f; }
.bar-fat     { background: #f4c06f; }

.macro-pct {
  width: 30px;
  text-align: right;
  flex-shrink: 0;
  color: rgba(245, 240, 232, 0.4);
  font-size: 12px;
}

.mock-meals {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mock-meal {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: rgba(245, 240, 232, 0.68);
}

.mock-meal span {
  color: rgba(245, 240, 232, 0.35);
}

/* ── Portfolio CTA ───────────────────────────────────────── */
.portfolio-section {
  padding: 104px 0;
  background: #1a2e1c;
}

.portfolio-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.portfolio-badge {
  display: inline-block;
  background: rgba(124, 184, 127, 0.14);
  color: #7cb87f;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 5px 14px;
  border-radius: 100px;
  margin-bottom: 24px;
}

.portfolio-section h2 {
  font-family: 'Fraunces', Georgia, serif;
  font-size: clamp(28px, 4vw, 46px);
  font-weight: 700;
  color: #f5f0e8;
  margin: 0 0 14px;
  letter-spacing: -0.025em;
}

.portfolio-section p {
  font-size: 16px;
  color: rgba(245, 240, 232, 0.5);
  margin: 0 0 44px;
  max-width: 400px;
  line-height: 1.65;
}

.portfolio-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
}

/* ── Buttons ─────────────────────────────────────────────── */
.btn-primary {
  background: #e07a5f;
  color: #fff;
  border: none;
  padding: 13px 28px;
  border-radius: 8px;
  font-family: 'DM Sans', sans-serif;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
  display: inline-flex;
  align-items: center;
  text-decoration: none;
}

.btn-primary:hover {
  background: #ce6c51;
  transform: translateY(-1px);
}

.btn-text {
  color: rgba(245, 240, 232, 0.55);
  font-size: 15px;
  text-decoration: none;
  font-family: 'DM Sans', sans-serif;
  transition: color 0.2s;
  display: inline-flex;
  align-items: center;
}

.btn-text:hover { color: #f5f0e8; }

.btn-outline {
  background: transparent;
  color: #f5f0e8;
  border: 1.5px solid rgba(245, 240, 232, 0.25);
  padding: 13px 28px;
  border-radius: 8px;
  font-family: 'DM Sans', sans-serif;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

.btn-outline:hover {
  border-color: rgba(245, 240, 232, 0.6);
  background: rgba(245, 240, 232, 0.05);
}

/* ── Responsive ──────────────────────────────────────────── */
@media (max-width: 960px) {
  .hero-plate { display: none; }
  .hero-visual { display: none; }
  .hero-inner { margin-left: 0; }

  .steps-grid {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .features-inner {
    grid-template-columns: 1fr;
    gap: 52px;
  }
}

@media (max-width: 600px) {
  .nav-inner { padding: 16px 20px; }

  .hero {
    padding: 100px 20px 64px;
  }

  .section-inner { padding: 0 20px; }

  .steps-section,
  .features-section,
  .portfolio-section { padding: 72px 0; }
}
</style>
