<template>
  <section class="portfolio-section">
    <div class="section-inner portfolio-inner">
      <span class="portfolio-badge">Portfolio Project</span>
      <h2>Built by Mert Aksehirlioglu</h2>
      <p>
        New signups are closed. You can explore the live demo or reach out
        directly.
      </p>
      <div class="portfolio-actions">
        <button class="btn-primary" @click="$emit('login')">Open Demo</button>
        <button class="btn-outline" @click="$emit('contact')">
          Get in Touch
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineEmits<{ login: []; contact: [] }>()
</script>

<style scoped>
.portfolio-section {
  padding: 104px 0;
  background: #1a2e1c;
}

.section-inner {
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 32px;
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
  transition:
    border-color 0.2s,
    background 0.2s;
}

.btn-outline:hover {
  border-color: rgba(245, 240, 232, 0.6);
  background: rgba(245, 240, 232, 0.05);
}

@media (max-width: 600px) {
  .section-inner {
    padding: 0 20px;
  }
  .portfolio-section {
    padding: 72px 0;
  }
}
</style>
