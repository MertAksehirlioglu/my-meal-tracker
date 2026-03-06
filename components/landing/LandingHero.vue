<template>
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
        <button class="btn-primary" @click="$emit('login')">
          Try the Demo
        </button>
        <a
          class="btn-text"
          href="https://github.com/MertAksehirlioglu/my-meal-tracker"
          target="_blank"
          rel="noopener"
          >View on GitHub ↗</a
        >
      </div>
    </div>

    <div class="hero-visual" aria-hidden="true">
      <div class="hero-blob hero-blob--1" />
      <div class="hero-blob hero-blob--2" />
      <div class="hero-plate">🥗</div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineEmits<{ login: [] }>()
</script>

<style scoped>
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
  background: radial-gradient(
    circle,
    rgba(44, 95, 46, 0.3) 0%,
    transparent 70%
  );
  right: 5%;
  top: 50%;
  transform: translateY(-50%);
}

.hero-blob--2 {
  width: 300px;
  height: 300px;
  background: radial-gradient(
    circle,
    rgba(224, 122, 95, 0.18) 0%,
    transparent 70%
  );
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
  transition:
    background 0.2s,
    transform 0.15s;
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

.btn-text:hover {
  color: #f5f0e8;
}

@media (max-width: 960px) {
  .hero-plate {
    display: none;
  }
  .hero-visual {
    display: none;
  }
  .hero-inner {
    margin-left: 0;
  }
}

@media (max-width: 600px) {
  .hero {
    padding: 100px 20px 64px;
  }
}
</style>
