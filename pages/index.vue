<template>
  <v-app class="landing-root">
    <!-- Navbar -->
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

    <LandingHero @login="goToLoginPage" />
    <LandingSteps />
    <LandingFeatures />
    <LandingCta @login="goToLoginPage" @contact="goToContactPage" />
  </v-app>
</template>

<script setup lang="ts">
const router = useRouter()
function goToLoginPage() {
  router.push('/login')
}
function goToContactPage() {
  router.push('/contact')
}
</script>

<style scoped>
.landing-root {
  font-family:
    'DM Sans',
    system-ui,
    -apple-system,
    sans-serif !important;
  background: #f9f7f4 !important;
}

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

.brand-mark {
  font-size: 20px;
}

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
  transition:
    border-color 0.2s,
    color 0.2s;
}

.nav-btn:hover {
  border-color: rgba(245, 240, 232, 0.7);
  color: #f5f0e8;
}

@media (max-width: 600px) {
  .nav-inner {
    padding: 16px 20px;
  }
}
</style>
