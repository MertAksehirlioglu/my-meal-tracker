<template>
  <v-container
    class="d-flex flex-column align-center justify-center text-center"
  >
    <v-card
      class="pa-6 mx-auto"
      max-width="600"
      elevation="8"
      style="border-radius: 18px"
    >
      <v-card-title class="font-weight-bold text-center">
        Contact Us
      </v-card-title>
      <p class="mb-4 text-grey-darken-1">
        We'd love to hear from you! Fill out the form or send us an email
        directly.
      </p>
      <v-form ref="formRef" v-model="formValid" @submit.prevent="onSubmit">
        <v-text-field
          v-model="name"
          label="Name"
          :rules="[(v) => !!v || 'Name is required']"
          required
          color="primary"
        />

        <v-text-field
          v-model="email"
          label="Email"
          :rules="[
            (v) => !!v || 'Email is required',
            (v) => /.+@.+\..+/.test(v) || 'Email must be valid',
          ]"
          required
          color="primary"
          type="email"
        />

        <v-textarea
          v-model="message"
          label="Message"
          :rules="[
            (v) => !!v || 'Message is required',
            (v) => v.length <= 500 || 'Message must be 500 characters or less',
          ]"
          required
          color="primary"
          class="mb-4"
          counter="500"
        />
        <v-btn
          :disabled="!formValid"
          color="primary"
          block
          size="large"
          type="submit"
        >
          Submit
        </v-btn>
        <v-alert v-if="showNotImplemented" type="warning" class="mt-2">
          Form submission is not implemented yet. Please use the email option
          below.
        </v-alert>
      </v-form>
      <v-divider class="my-4" />
      <div class="mb-4 text-center">
        Prefer email? Click below to send us a message directly.
      </div>
      <v-btn
        color="primary"
        block
        size="large"
        :href="mailtoLink"
        target="_blank"
        rel="noopener"
      >
        <v-icon left>mdi-email</v-icon>
        Send Email
      </v-btn>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const contactMail = import.meta.env.VITE_CONTACT_MAIL || 'default@example.com'
const mailtoLink = `mailto:${contactMail}`
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
    console.log('[TODO] Implement contact form submission. Current values:', {
      name: name.value,
      email: email.value,
      message: message.value,
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
