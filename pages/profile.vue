<template>
  <v-container class="fill-height pa-4" style="max-width: 800px">
    <!-- Header -->
    <div class="d-flex align-center mb-6">
      <h1 class="text-h5 font-weight-bold">Profile</h1>
    </div>

    <!-- Demo Mode Notice -->
    <v-alert
      v-if="isDemoUser"
      type="info"
      variant="tonal"
      class="mb-6"
      icon="mdi-information"
    >
      <v-alert-title>Demo Mode</v-alert-title>
      You're viewing demo profile data. Profile changes and avatar uploads are
      not available in demo mode.
      <a
        href="/signup"
        class="text-primary text-decoration-none font-weight-bold"
      >
        Create an account
      </a>
      to save your personal information and customize your profile.
    </v-alert>

    <v-form ref="formRef" v-model="formValid" @submit.prevent="saveProfile">
      <!-- Personal Information -->
      <v-card class="mb-6" elevation="2" rounded="lg">
        <v-card-title class="text-h6 font-weight-bold"
          >Personal Information</v-card-title
        >
        <v-card-text>
          <v-text-field
            v-model="profile.name"
            label="Full Name"
            variant="outlined"
            class="mb-3"
            :rules="[requiredRule]"
            required
          />

          <v-text-field
            v-model="profile.email"
            label="Email"
            variant="outlined"
            class="mb-3"
            type="email"
            disabled
            hint="Email cannot be changed"
          />

          <v-row>
            <v-col cols="6">
              <v-text-field
                v-model.number="profile.height"
                label="Height (cm)"
                variant="outlined"
                type="number"
                min="100"
                max="250"
                :rules="[heightRule]"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model.number="profile.weight"
                label="Weight (kg)"
                variant="outlined"
                type="number"
                min="30"
                max="300"
                :rules="[weightRule]"
              />
            </v-col>
          </v-row>

          <v-text-field
            v-model.number="profile.age"
            label="Age"
            variant="outlined"
            class="mb-3"
            type="number"
            min="13"
            max="120"
            :rules="[ageRule]"
          />
        </v-card-text>
      </v-card>

      <!-- Activity & Goals -->
      <v-card class="mb-6" elevation="2" rounded="lg">
        <v-card-title class="text-h6 font-weight-bold"
          >Activity & Goals</v-card-title
        >
        <v-card-text>
          <v-select
            v-model="profile.activity_level"
            label="Activity Level"
            variant="outlined"
            class="mb-3"
            :items="activityLevels"
            item-title="label"
            item-value="value"
            :rules="[requiredRule]"
            required
          />

          <v-select
            v-model="profile.goal"
            label="Fitness Goal"
            variant="outlined"
            class="mb-3"
            :items="goals"
            item-title="label"
            item-value="value"
            :rules="[requiredRule]"
            required
          />

          <v-text-field
            v-model.number="profile.daily_calorie_target"
            label="Daily Calorie Target"
            variant="outlined"
            type="number"
            min="1200"
            max="5000"
            hint="Recommended: 1200-5000 calories"
            :rules="[calorieRule]"
          />
        </v-card-text>
      </v-card>

      <!-- Avatar -->
      <v-card class="mb-6" elevation="2" rounded="lg">
        <v-card-title class="text-h6 font-weight-bold"
          >Profile Picture</v-card-title
        >
        <v-card-text>
          <div class="d-flex align-center">
            <v-avatar size="80" class="mr-4">
              <v-img
                v-if="profile.avatar_url"
                :src="profile.avatar_url"
                alt="Profile Picture"
              />
              <v-icon v-else size="40" color="grey">mdi-account</v-icon>
            </v-avatar>
            <div>
              <v-btn
                color="primary"
                variant="outlined"
                class="mb-2"
                @click="uploadAvatar"
              >
                <v-icon left>mdi-camera</v-icon>
                Upload Photo
              </v-btn>
              <div class="text-caption text-grey">
                Upload a profile picture to personalize your experience
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Save Button -->
      <v-btn
        :disabled="!formValid || loading"
        color="primary"
        size="large"
        block
        type="submit"
        class="mb-4"
      >
        <v-progress-circular
          v-if="loading"
          indeterminate
          color="white"
          size="20"
          class="mr-2"
        />
        Save Changes
      </v-btn>

      <!-- Success/Error Messages -->
      <v-alert v-if="success" type="success" class="mb-4">
        Profile updated successfully!
      </v-alert>

      <v-alert v-if="error" type="error" class="mb-4">
        {{ error }}
      </v-alert>
    </v-form>

    <!-- Hidden file input for avatar upload -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      style="display: none"
      @change="handleAvatarUpload"
    />

    <!-- [Feature] Weight History & Trend Chart -->
    <v-card class="mb-6" elevation="2" rounded="lg">
      <v-card-title class="text-h6 font-weight-bold"
        >Weight History</v-card-title
      >
      <v-card-text>
        <!-- Log new weight -->
        <v-row align="center" class="mb-4">
          <v-col cols="5">
            <v-text-field
              v-model.number="newWeight"
              label="Weight (kg)"
              variant="outlined"
              type="number"
              density="compact"
              hide-details
              :min="20"
              :max="500"
            />
          </v-col>
          <v-col cols="4">
            <v-text-field
              v-model="weightDate"
              label="Date"
              variant="outlined"
              type="date"
              density="compact"
              hide-details
            />
          </v-col>
          <v-col cols="3">
            <v-btn
              color="primary"
              block
              :loading="weightLoading"
              :disabled="!newWeight || isDemoUser"
              @click="logWeight"
            >
              Log
            </v-btn>
          </v-col>
        </v-row>

        <v-alert v-if="weightError" type="error" density="compact" class="mb-3">
          {{ weightError }}
        </v-alert>

        <!-- Simple SVG trend line -->
        <div v-if="weightLog.length > 1" class="weight-chart mb-4">
          <svg viewBox="0 0 300 80" style="width: 100%; height: 80px">
            <polyline
              :points="
                weightLog
                  .map((e, i) => {
                    const x = (i / (weightLog.length - 1)) * 290 + 5
                    const vals = weightLog.map((w) => w.weight_kg)
                    const minV = Math.min(...vals)
                    const maxV = Math.max(...vals)
                    const range = maxV - minV || 1
                    const y = 75 - ((e.weight_kg - minV) / range) * 65
                    return `${x},${y}`
                  })
                  .join(' ')
              "
              fill="none"
              stroke="#1976d2"
              stroke-width="2"
              stroke-linejoin="round"
            />
          </svg>
        </div>

        <!-- Log entries list -->
        <v-list v-if="weightLog.length > 0" density="compact" class="pa-0">
          <v-list-item
            v-for="entry in [...weightLog].reverse().slice(0, 10)"
            :key="entry.id"
            :title="`${entry.weight_kg} kg`"
            :subtitle="entry.date"
          >
            <template #prepend>
              <v-icon color="blue" size="18">mdi-scale-bathroom</v-icon>
            </template>
          </v-list-item>
        </v-list>
        <p v-else class="text-grey-darken-1 text-body-2">
          No weight entries yet. Log your first weight above.
        </p>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
// import { useRouter } from 'vue-router' // TODO: Use router when needed
import { useAuth } from '~/composables/useAuth'
import { useFormValidation } from '~/composables/useFormValidation'
import type { UpdateUser } from '~/server/database/schemas'

// Page meta
definePageMeta({
  middleware: 'auth' as never,
  layout: 'authenticated',
})

// const router = useRouter() // TODO: Use router when needed
const { user, isDemoUser } = useAuth()
const { requiredRule, heightRule, weightRule, ageRule, calorieRule } =
  useFormValidation()

// Form refs
const formRef = ref()
const formValid = ref(false)
const fileInput = ref<HTMLInputElement>()

// Reactive data
const profile = ref<UpdateUser>({
  name: '',
  email: '',
  height: undefined,
  weight: undefined,
  age: undefined,
  activity_level: undefined,
  goal: undefined,
  daily_calorie_target: undefined,
  avatar_url: undefined,
})

const loading = ref(false)
const success = ref(false)
const error = ref('')

// Options
const activityLevels = [
  { label: 'Sedentary (little or no exercise)', value: 'sedentary' },
  { label: 'Light (light exercise/sports 1-3 days/week)', value: 'light' },
  {
    label: 'Moderate (moderate exercise/sports 3-5 days/week)',
    value: 'moderate',
  },
  { label: 'Active (hard exercise/sports 6-7 days a week)', value: 'active' },
  {
    label: 'Very Active (very hard exercise, physical job)',
    value: 'very_active',
  },
]

const goals = [
  { label: 'Lose Weight', value: 'lose' },
  { label: 'Maintain Weight', value: 'maintain' },
  { label: 'Gain Weight', value: 'gain' },
]

// Methods
const loadProfile = async () => {
  if (!user.value) return

  try {
    // Load user profile data
    const { authenticatedFetch } = useAuthenticatedFetch()
    const response = (await authenticatedFetch(
      `/api/users/${user.value.id}`
    ).then((r) => r.json())) as { success: boolean; data?: UpdateUser }
    if (response.success && response.data) {
      profile.value = { ...response.data }
    }
  } catch (err) {
    console.error('Error loading profile:', err)
    error.value = 'Failed to load profile data'
  }
}

const saveProfile = async () => {
  if (!user.value?.id) return

  // Show demo restriction message for demo users
  if (isDemoUser.value) {
    error.value =
      'Profile updates are not available in demo mode. Sign up for a full account to save your profile changes!'
    return
  }

  loading.value = true
  error.value = ''
  success.value = false

  try {
    const { authenticatedFetch } = useAuthenticatedFetch()
    const response = (await authenticatedFetch(`/api/users/${user.value.id}`, {
      method: 'PUT',
      body: JSON.stringify(profile.value),
    }).then((r) => r.json())) as {
      success: boolean
      data?: UpdateUser
      message?: string
    }

    if (response.success) {
      success.value = true
      // Update the user in auth store
      // You might want to refresh the user data here
    } else {
      error.value = response.message || 'Failed to update profile'
    }
  } catch (err) {
    console.error('Error saving profile:', err)
    error.value = 'Failed to save profile'
  } finally {
    loading.value = false
  }
}

const uploadAvatar = () => {
  fileInput.value?.click()
}

const handleAvatarUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file || !user.value?.id) return

  // Show demo restriction message for demo users
  if (isDemoUser.value) {
    error.value =
      'Avatar uploads are not available in demo mode. Sign up for a full account to upload a profile picture!'
    // Reset file input
    if (target) target.value = ''
    return
  }

  try {
    loading.value = true

    // Create FormData for file upload
    const formData = new FormData()
    formData.append('avatar', file)

    const { authenticatedFetch } = useAuthenticatedFetch()
    const response = (await authenticatedFetch(
      `/api/users/${user.value.id}/avatar`,
      {
        method: 'POST',
        body: formData,
      }
    ).then((r) => r.json())) as {
      success: boolean
      data?: { avatar_url: string }
      message?: string
    }

    if (response.success && response.data) {
      profile.value.avatar_url = response.data.avatar_url
      success.value = true
    } else {
      error.value = response.message || 'Failed to upload avatar'
    }
  } catch (err) {
    console.error('Error uploading avatar:', err)
    error.value = 'Failed to upload avatar'
  } finally {
    loading.value = false
    // Reset file input
    if (target) target.value = ''
  }
}

// [Feature] Body Weight History & Trend
interface WeightEntry {
  id: string
  date: string
  weight_kg: number
  created_at: string
}

const weightLog = ref<WeightEntry[]>([])
const newWeight = ref<number | undefined>(undefined)
const weightDate = ref(new Date().toISOString().split('T')[0])
const weightLoading = ref(false)
const weightError = ref('')

const loadWeightLog = async () => {
  if (!user.value?.id) return
  try {
    const { authenticatedFetch } = useAuthenticatedFetch()
    const res = await authenticatedFetch(
      `/api/users/${user.value.id}/weight-log`
    )
    if (res.ok) {
      const json = (await res.json()) as { data?: WeightEntry[] }
      weightLog.value = json.data ?? []
    }
  } catch {
    // non-critical
  }
}

const logWeight = async () => {
  if (!user.value?.id || !newWeight.value) return
  weightLoading.value = true
  weightError.value = ''
  try {
    const { authenticatedFetch } = useAuthenticatedFetch()
    const res = await authenticatedFetch(
      `/api/users/${user.value.id}/weight-log`,
      {
        method: 'POST',
        body: JSON.stringify({
          weight_kg: newWeight.value,
          date: weightDate.value,
        }),
      }
    )
    if (res.ok) {
      await loadWeightLog()
      newWeight.value = undefined
    } else {
      weightError.value = 'Failed to log weight'
    }
  } catch {
    weightError.value = 'Failed to log weight'
  } finally {
    weightLoading.value = false
  }
}

onMounted(() => {
  loadProfile()
  loadWeightLog()
})
</script>
