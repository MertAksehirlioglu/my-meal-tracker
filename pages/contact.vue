<template>
  <v-container class="fill-height d-flex flex-column align-center justify-center">
    <v-card class="pa-8 py-10 mx-auto" max-width="600" elevation="10" rounded="xl">
      <div class="d-flex flex-column align-center mb-6">
        <v-icon size="48" color="primary" class="mb-2">mdi-email-outline</v-icon>
        <h2 class="font-weight-bold mb-2 text-primary">Contact Us</h2>
        <p class="mb-0 text-grey-darken-1">We'd love to hear from you! Fill out the form or send us an email directly.</p>
      </div>
      <v-form class="mb-4" @submit.prevent="onSubmit" ref="formRef" v-model="formValid">
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="name"
              label="Name"
              :rules="[v => !!v || 'Name is required']"
              required
              color="primary"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="email"
              label="Email"
              :rules="[v => !!v || 'Email is required', v => /.+@.+\..+/.test(v) || 'Email must be valid']"
              required
              color="primary"
              type="email"
            />
          </v-col>
        </v-row>
        <v-textarea
          v-model="message"
          label="Message"
          :rules="[v => !!v || 'Message is required']"
          required
          color="primary"
          class="mb-4"
          rows="4"
          auto-grow
        />
        <v-btn :disabled="!formValid" color="primary" block size="large" class="mb-2" type="submit">Submit</v-btn>
        <v-alert v-if="showNotImplemented" type="warning" class="mt-2">
          Form submission is not implemented yet. Please use the email option below.
        </v-alert>
      </v-form>
      <div class="d-flex align-center my-4">
        <v-divider class="flex-grow-1" />
        <span class="mx-4 text-grey">or</span>
        <v-divider class="flex-grow-1" />
      </div>
      <v-btn color="secondary" block size="large" :href="mailtoLink" target="_blank" rel="noopener">
        <v-icon left>mdi-email</v-icon>
        Send Email
      </v-btn>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const mailtoLink = 'mailto:mertaksehirlioglu@hotmail.com'
const name = ref('')
const email = ref('')
const message = ref('')
const formValid = ref(false)
const formRef = ref()
const showNotImplemented = ref(false)

// TODO: Implement backend/API integration for contact form submission
function onSubmit() {
  if (formRef.value?.validate()) {
    showNotImplemented.value = true
    // eslint-disable-next-line no-console
    console.log('[TODO] Implement contact form submission. Current values:', {
      name: name.value,
      email: email.value,
      message: message.value
    })
    setTimeout(() => {
      showNotImplemented.value = false
      name.value = ''
      email.value = ''
      message.value = ''
      formRef.value?.resetValidation()
    }, 3500)
  }
}
</script>
