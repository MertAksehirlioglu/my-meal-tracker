<template>
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
</template>

<style scoped>
.features-section {
  padding: 104px 0;
  background: #ffffff;
  border-top: 1px solid #ede9e3;
  border-bottom: 1px solid #ede9e3;
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

.bar-protein {
  background: #7cb87f;
}
.bar-carbs {
  background: #e07a5f;
}
.bar-fat {
  background: #f4c06f;
}

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

@media (max-width: 960px) {
  .features-inner {
    grid-template-columns: 1fr;
    gap: 52px;
  }
}

@media (max-width: 600px) {
  .section-inner {
    padding: 0 20px;
  }
  .features-section {
    padding: 72px 0;
  }
}
</style>
