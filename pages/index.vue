<template>
  <v-app>
    <v-app-bar app flat class="d-flex align-center px-4" color="primary">
      <img
        src="/logo.png"
        alt="MealSnap Logo"
        class="mr-3"
        style="max-width: 40px; max-height: 40px; border-radius: 8px"
      />
      <span class="font-weight-bold text-h5" style="letter-spacing: 1px"
        >MealSnap</span
      >
      <v-spacer />
      <v-btn icon aria-label="Login" @click="goToLoginPage">
        <v-icon>mdi-account</v-icon>
      </v-btn>
      <v-btn icon aria-label="Contact" @click="goToContactPage">
        <v-icon>mdi-email</v-icon>
      </v-btn>
    </v-app-bar>
    <!-- Hero Section -->
    <v-main
      class="landing-hero d-flex flex-column align-center justify-center text-center py-10 px-4 mt-10"
    >
      <img
        src="/logo.png"
        alt="Healthy Meal"
        class="mb-6 rounded-lg"
        style="max-width: 350px; height: 200px; object-fit: cover"
      />
      <h1 class="display-1 font-weight-bold mb-2">Welcome to MealSnap</h1>
      <p class="subtitle-1 mb-4">
        AI-powered nutrition tracking, macro goals, and more. Built for your
        healthy lifestyle.
      </p>
      <v-btn
        color="primary"
        size="large"
        class="mb-6"
        @click="scrollToSection('get-started')"
        >Get Started</v-btn
      >
    </v-main>
    <!-- More Information Section -->
    <v-container
      id="more-info"
      class="py-8 d-flex flex-column align-center justify-center text-center"
    >
      <v-row class="justify-center">
        <v-col
          cols="12"
          md="8"
          class="d-flex flex-column align-center justify-center"
        >
          <img
            src="/taking-picture.png"
            alt="Taking Picture"
            class="rounded-lg mb-4"
            style="max-width: 600px; height: 240px; object-fit: cover"
          />
        </v-col>
        <v-col
          cols="12"
          md="8"
          class="d-flex flex-column align-center justify-center text-center"
        >
          <h2 class="font-weight-bold mb-2">Smarter Meal Tracking</h2>
          <p>
            Snap a photo, let AI analyze your meal, and log nutrition instantly.
            Set daily macro goals and track your progress with beautiful charts.
          </p>
        </v-col>
      </v-row>
    </v-container>
    <!-- Login Section -->
    <v-container id="login" class="py-8 text-center">
      <h2 class="font-weight-bold mb-2">Login to Your Account</h2>
      <p class="mb-4">
        Access your personalized dashboard and start tracking today.
      </p>
      <v-btn
        color="primary"
        variant="outlined"
        size="large"
        @click="goToLoginPage"
        >Login</v-btn
      >
    </v-container>
    <!-- Testimonials Section -->
    <v-container id="testimonials" class="py-8">
      <h2 class="font-weight-bold text-center mb-6">What Our Users Say</h2>
      <v-row>
        <v-col
          v-for="(testimonial, i) in testimonials"
          :key="i"
          cols="12"
          sm="6"
          md="4"
        >
          <v-card class="pa-4 mb-4">
            <v-avatar size="56" class="mb-2">
              <v-img :src="testimonial.avatar" />
            </v-avatar>
            <div class="font-italic mb-2">"{{ testimonial.quote }}"</div>
            <div class="font-weight-bold">- {{ testimonial.name }}</div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    <!-- Contact Section -->
    <v-container id="contact" class="py-8 text-center">
      <h2 class="font-weight-bold mb-2">Contact Us</h2>
      <p class="mb-4">
        Have questions or feedback? You can fill out our contact form or send us
        an email on the next page.
      </p>
      <v-btn
        color="primary"
        variant="outlined"
        size="large"
        @click="goToContactPage"
        >Contact Form / Email</v-btn
      >
    </v-container>
    <!-- Get Started Section -->
    <v-footer
      id="get-started"
      class="py-6 d-flex flex-column align-center"
      color="secondary"
    >
      <h2 class="font-weight-bold mb-2">Ready to Start?</h2>
      <v-btn variant="outlined" size="x-large" @click="goToSignupPage"
        >Sign Up Free</v-btn
      >
    </v-footer>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const testimonials = ref([
  {
    name: 'Jane Doe',
    quote:
      'This app made tracking my meals so easy and fun! Highly recommended.',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    name: 'John Smith',
    quote: 'I love the AI meal analysis. It saves me so much time every day.',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    name: 'Emily Chen',
    quote:
      'Beautiful design and super mobile-friendly. My go-to nutrition app!',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
  },
])

function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

const router = useRouter()
function goToLoginPage() {
  router.push('/login')
}
function goToSignupPage() {
  router.push('/signup')
}
function goToContactPage() {
  router.push('/contact')
}
</script>

<style scoped>
.landing-hero {
  min-height: 80vh;
  background: linear-gradient(135deg, #e0f7fa 0%, #fffde4 100%);
}
@media (max-width: 600px) {
  .landing-hero {
    min-height: 60vh;
    padding-top: 2rem;
    padding-bottom: 2rem;
  }
}
</style>
