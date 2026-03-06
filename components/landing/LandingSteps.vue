<template>
  <section class="steps-section">
    <div class="section-inner">
      <p class="section-eyebrow">How it works</p>
      <div class="steps-grid">
        <div class="step">
          <div class="step-num">01</div>
          <div class="step-icon">📸</div>
          <h3>Snap</h3>
          <p>
            Take or upload a photo of any meal — home-cooked, restaurant, or
            snack.
          </p>
        </div>
        <div class="step">
          <div class="step-num">02</div>
          <div class="step-icon">🧠</div>
          <h3>Analyze</h3>
          <p>
            AI identifies every ingredient and calculates calories, protein,
            carbs, and fat.
          </p>
        </div>
        <div class="step">
          <div class="step-num">03</div>
          <div class="step-icon">📊</div>
          <h3>Track</h3>
          <p>
            Watch your macros stack up through the day and measure against your
            personal goals.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.steps-section {
  padding: 104px 0;
  background: #f9f7f4;
}

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

@media (max-width: 960px) {
  .steps-grid {
    grid-template-columns: 1fr;
    gap: 40px;
  }
}

@media (max-width: 600px) {
  .section-inner {
    padding: 0 20px;
  }
  .steps-section {
    padding: 72px 0;
  }
}
</style>
