<template>
  <v-container class="fill-height pa-4" style="max-width: 800px">
    <!-- Header -->
    <div class="d-flex align-center mb-6">
      <h1 class="text-h5 font-weight-bold">Goals</h1>
    </div>

    <!-- Current Active Goal -->
    <v-card v-if="activeGoal" class="mb-6" elevation="2" rounded="lg">
      <v-card-title
        class="text-h6 font-weight-bold d-flex align-center justify-space-between"
      >
        Current Goal
        <v-chip color="success" size="small">Active</v-chip>
      </v-card-title>
      <v-card-text>
        <div
          class="d-grid gap-3"
          style="grid-template-columns: repeat(auto-fit, minmax(120px, 1fr))"
        >
          <div v-if="activeGoal.target_weight" class="text-center">
            <div class="text-h6 font-weight-bold text-primary">
              {{ activeGoal.target_weight }}kg
            </div>
            <div class="text-caption text-grey">Target Weight</div>
          </div>
          <div v-if="activeGoal.target_calories" class="text-center">
            <div class="text-h6 font-weight-bold text-success">
              {{ activeGoal.target_calories }} cal
            </div>
            <div class="text-caption text-grey">Daily Calories</div>
          </div>
          <div v-if="activeGoal.target_protein" class="text-center">
            <div class="text-h6 font-weight-bold text-warning">
              {{ activeGoal.target_protein }}g
            </div>
            <div class="text-caption text-grey">Protein</div>
          </div>
          <div v-if="activeGoal.target_carbs" class="text-center">
            <div class="text-h6 font-weight-bold text-info">
              {{ activeGoal.target_carbs }}g
            </div>
            <div class="text-caption text-grey">Carbs</div>
          </div>
        </div>

        <v-divider class="my-4" />

        <div class="d-flex justify-space-between align-center">
          <div>
            <div class="text-caption text-grey">Started</div>
            <div class="font-weight-medium">
              {{ formatDate(activeGoal.start_date) }}
            </div>
          </div>
          <div v-if="activeGoal.end_date">
            <div class="text-caption text-grey">End Date</div>
            <div class="font-weight-medium">
              {{ formatDate(activeGoal.end_date) }}
            </div>
          </div>
          <v-btn
            color="primary"
            variant="outlined"
            size="small"
            @click="editGoal(activeGoal)"
          >
            Edit Goal
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Create New Goal Button -->
    <v-btn
      v-if="!activeGoal"
      color="primary"
      size="large"
      block
      class="mb-6"
      @click="showGoalDialog = true"
    >
      <v-icon left>mdi-plus</v-icon>
      Create New Goal
    </v-btn>

    <!-- Goal History -->
    <v-card elevation="2" rounded="lg">
      <v-card-title class="text-h6 font-weight-bold">Goal History</v-card-title>
      <v-card-text>
        <div v-if="goalHistory.length === 0" class="text-center py-8">
          <v-icon size="64" color="grey-lighten-1" class="mb-4"
            >mdi-target</v-icon
          >
          <p class="text-grey">No goals created yet</p>
          <v-btn color="primary" class="mt-2" @click="showGoalDialog = true"
            >Create Your First Goal</v-btn
          >
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="goal in goalHistory"
            :key="goal.id"
            class="d-flex align-center justify-space-between p-3 rounded-lg"
            :style="{ backgroundColor: goal.is_active ? '#e8f5e8' : '#f5f5f5' }"
          >
            <div class="flex-grow-1">
              <div class="d-flex align-center mb-1">
                <span class="font-weight-medium">{{ getGoalTitle(goal) }}</span>
                <v-chip
                  v-if="goal.is_active"
                  color="success"
                  size="x-small"
                  class="ml-2"
                  >Active</v-chip
                >
              </div>
              <div class="text-caption text-grey">
                {{ formatDate(goal.start_date) }} -
                {{ goal.end_date ? formatDate(goal.end_date) : 'Ongoing' }}
              </div>
            </div>
            <div class="text-right">
              <div v-if="goal.target_calories" class="font-weight-medium">
                {{ goal.target_calories }} cal
              </div>
              <div v-if="goal.target_weight" class="text-caption text-grey">
                {{ goal.target_weight }}kg
              </div>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Goal Dialog -->
    <v-dialog v-model="showGoalDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h6 font-weight-bold">
          {{ editingGoal ? 'Edit Goal' : 'Create New Goal' }}
        </v-card-title>

        <v-form
          ref="goalFormRef"
          v-model="goalFormValid"
          @submit.prevent="saveGoal"
        >
          <v-card-text>
            <v-text-field
              v-model.number="goalForm.target_weight"
              label="Target Weight (kg)"
              variant="outlined"
              type="number"
              min="30"
              max="300"
              class="mb-3"
              :rules="[
                (v) =>
                  !v ||
                  (v >= 30 && v <= 300) ||
                  'Weight must be between 30-300 kg',
              ]"
            />

            <v-text-field
              v-model.number="goalForm.target_calories"
              label="Daily Calorie Target"
              variant="outlined"
              type="number"
              min="1200"
              max="5000"
              class="mb-3"
              :rules="[
                (v) =>
                  !v ||
                  (v >= 1200 && v <= 5000) ||
                  'Calories must be between 1200-5000',
              ]"
            />

            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model.number="goalForm.target_protein"
                  label="Protein (g)"
                  variant="outlined"
                  type="number"
                  min="0"
                  max="500"
                  class="mb-3"
                  :rules="[
                    (v) =>
                      !v ||
                      (v >= 0 && v <= 500) ||
                      'Protein must be between 0-500g',
                  ]"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model.number="goalForm.target_carbs"
                  label="Carbs (g)"
                  variant="outlined"
                  type="number"
                  min="0"
                  max="1000"
                  class="mb-3"
                  :rules="[
                    (v) =>
                      !v ||
                      (v >= 0 && v <= 1000) ||
                      'Carbs must be between 0-1000g',
                  ]"
                />
              </v-col>
            </v-row>

            <v-text-field
              v-model.number="goalForm.target_fat"
              label="Fat (g)"
              variant="outlined"
              type="number"
              min="0"
              max="200"
              class="mb-3"
              :rules="[
                (v) =>
                  !v || (v >= 0 && v <= 200) || 'Fat must be between 0-200g',
              ]"
            />

            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="goalForm.start_date"
                  label="Start Date"
                  variant="outlined"
                  type="date"
                  class="mb-3"
                  :rules="[(v) => !!v || 'Start date is required']"
                  required
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="goalForm.end_date"
                  label="End Date (Optional)"
                  variant="outlined"
                  type="date"
                  class="mb-3"
                  :min="goalForm.start_date"
                />
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-actions class="pa-4">
            <v-spacer />
            <v-btn
              variant="outlined"
              class="mr-2"
              @click="showGoalDialog = false"
            >
              Cancel
            </v-btn>
            <v-btn
              color="primary"
              :disabled="!goalFormValid || loading"
              :loading="loading"
              @click="saveGoal"
            >
              {{ editingGoal ? 'Update' : 'Create' }}
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <!-- Success/Error Messages -->
    <v-alert v-if="success" type="success" class="mt-4">
      {{ success }}
    </v-alert>

    <v-alert v-if="error" type="error" class="mt-4">
      {{ error }}
    </v-alert>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
// import { useRouter } from 'vue-router' // TODO: Use router when needed
import { useAuth } from '~/composables/useAuth'
import type { UserGoal, CreateUserGoal } from '~/server/database/schemas'

// Page meta
definePageMeta({
  middleware: 'auth' as never,
  layout: 'authenticated',
})

// const router = useRouter() // TODO: Use router when needed
const { user } = useAuth()

// Form refs
const goalFormRef = ref()
const goalFormValid = ref(false)

// Reactive data
const activeGoal = ref<UserGoal | null>(null)
const goalHistory = ref<UserGoal[]>([])
const showGoalDialog = ref(false)
const editingGoal = ref<UserGoal | null>(null)
const loading = ref(false)
const success = ref('')
const error = ref('')

// Goal form
const goalForm = ref<CreateUserGoal>({
  user_id: '',
  target_weight: undefined,
  target_calories: undefined,
  target_protein: undefined,
  target_carbs: undefined,
  target_fat: undefined,
  start_date: new Date().toISOString().split('T')[0],
  end_date: undefined,
  is_active: true,
})

// Methods
const loadGoals = async () => {
  if (!user.value?.id) return

  try {
    const { authenticatedFetch } = useAuthenticatedFetch()
    const response = (await authenticatedFetch('/api/goals').then((r) =>
      r.json()
    )) as {
      success: boolean
      data?: UserGoal[]
    }
    if (response.success) {
      goalHistory.value = response.data || []
      activeGoal.value =
        goalHistory.value.find((goal) => goal.is_active) || null
    }
  } catch (err) {
    console.error('Error loading goals:', err)
    error.value = 'Failed to load goals'
  }
}

const editGoal = (goal: UserGoal) => {
  editingGoal.value = goal
  goalForm.value = {
    user_id: goal.user_id,
    target_weight: goal.target_weight,
    target_calories: goal.target_calories,
    target_protein: goal.target_protein,
    target_carbs: goal.target_carbs,
    target_fat: goal.target_fat,
    start_date: goal.start_date.split('T')[0],
    end_date: goal.end_date?.split('T')[0],
    is_active: goal.is_active,
  }
  showGoalDialog.value = true
}

const saveGoal = async () => {
  if (!goalFormRef.value?.validate() || !user.value?.id) return

  loading.value = true
  error.value = ''
  success.value = ''

  try {
    const payload = {
      ...goalForm.value,
      user_id: user.value.id,
    }

    const { authenticatedFetch } = useAuthenticatedFetch()
    let response
    if (editingGoal.value) {
      response = (await authenticatedFetch(
        `/api/goals/${editingGoal.value.id}`,
        {
          method: 'PUT',
          body: JSON.stringify(payload),
        }
      ).then((r) => r.json())) as {
        success: boolean
        data?: UserGoal
        message?: string
      }
    } else {
      response = (await authenticatedFetch('/api/goals', {
        method: 'POST',
        body: JSON.stringify(payload),
      }).then((r) => r.json())) as {
        success: boolean
        data?: UserGoal
        message?: string
      }
    }

    if (response.success) {
      success.value = editingGoal.value
        ? 'Goal updated successfully!'
        : 'Goal created successfully!'
      showGoalDialog.value = false
      editingGoal.value = null
      resetGoalForm()
      await loadGoals()
    } else {
      error.value = response.message || 'Failed to save goal'
    }
  } catch (err) {
    console.error('Error saving goal:', err)
    error.value = 'Failed to save goal'
  } finally {
    loading.value = false
  }
}

const resetGoalForm = () => {
  goalForm.value = {
    user_id: '',
    target_weight: undefined,
    target_calories: undefined,
    target_protein: undefined,
    target_carbs: undefined,
    target_fat: undefined,
    start_date: new Date().toISOString().split('T')[0],
    end_date: undefined,
    is_active: true,
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const getGoalTitle = (goal: UserGoal) => {
  if (goal.target_weight && goal.target_calories) {
    return `${goal.target_weight}kg, ${goal.target_calories} cal`
  } else if (goal.target_weight) {
    return `${goal.target_weight}kg target`
  } else if (goal.target_calories) {
    return `${goal.target_calories} cal target`
  }
  return 'Custom goal'
}

onMounted(() => {
  loadGoals()
})
</script>

<style scoped>
.space-y-3 > * + * {
  margin-top: 12px;
}

.d-grid {
  display: grid;
}

.gap-3 {
  gap: 12px;
}
</style>
