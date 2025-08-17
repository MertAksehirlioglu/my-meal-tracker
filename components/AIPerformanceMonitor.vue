<template>
  <v-card v-if="showMetrics" class="mb-4" elevation="2" rounded="lg">
    <v-card-title class="d-flex align-center justify-space-between">
      <span class="text-h6">AI Performance</span>
      <v-btn
        icon="mdi-close"
        variant="text"
        size="small"
        @click="$emit('close')"
      />
    </v-card-title>

    <v-card-text>
      <v-row>
        <v-col cols="6" sm="3">
          <div class="text-center">
            <div class="text-h5 font-weight-bold text-primary">
              {{ metrics.totalAnalyses }}
            </div>
            <div class="text-caption text-grey">Total Analyses</div>
          </div>
        </v-col>

        <v-col cols="6" sm="3">
          <div class="text-center">
            <div class="text-h5 font-weight-bold text-success">
              {{ successRate.toFixed(1) }}%
            </div>
            <div class="text-caption text-grey">Success Rate</div>
          </div>
        </v-col>

        <v-col cols="6" sm="3">
          <div class="text-center">
            <div class="text-h5 font-weight-bold text-info">
              {{ averageTimeDisplay }}
            </div>
            <div class="text-caption text-grey">Avg Time</div>
          </div>
        </v-col>

        <v-col cols="6" sm="3">
          <div class="text-center">
            <div class="text-h5 font-weight-bold text-warning">
              {{ cacheSize }}
            </div>
            <div class="text-caption text-grey">Cache Size</div>
          </div>
        </v-col>
      </v-row>

      <v-row v-if="metrics.cacheHits > 0" class="mt-2">
        <v-col>
          <v-chip color="success" size="small" class="mr-2">
            <v-icon start icon="mdi-flash" />
            {{ metrics.cacheHits }} Cache Hits
          </v-chip>
          <v-chip color="info" size="small">
            <v-icon start icon="mdi-speedometer" />
            {{ cacheHitRate.toFixed(1) }}% Cache Rate
          </v-chip>
        </v-col>
      </v-row>

      <div v-if="processingStage" class="mt-4">
        <v-progress-linear indeterminate color="primary" class="mb-2" />
        <div class="text-caption text-center">{{ processingStage }}</div>
      </div>
    </v-card-text>

    <v-card-actions>
      <v-btn
        variant="text"
        size="small"
        :disabled="cacheSize === 0"
        @click="$emit('clearCache')"
      >
        Clear Cache
      </v-btn>
      <v-spacer />
      <v-btn
        variant="text"
        size="small"
        :disabled="metrics.totalAnalyses === 0"
        @click="$emit('resetMetrics')"
      >
        Reset Stats
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface PerformanceMetrics {
  totalAnalyses: number
  successfulAnalyses: number
  averageTime: number
  cacheHits: number
  providerUsage: Record<string, number>
}

interface Props {
  metrics: PerformanceMetrics
  cacheSize: number
  processingStage?: string
  showMetrics?: boolean
}

interface Emits {
  (_event: 'close' | 'clearCache' | 'resetMetrics'): void
}

const props = withDefaults(defineProps<Props>(), {
  showMetrics: true,
  processingStage: '',
})

defineEmits<Emits>()

const successRate = computed(() =>
  props.metrics.totalAnalyses > 0
    ? (props.metrics.successfulAnalyses / props.metrics.totalAnalyses) * 100
    : 0
)

const cacheHitRate = computed(() =>
  props.metrics.totalAnalyses > 0
    ? (props.metrics.cacheHits / props.metrics.totalAnalyses) * 100
    : 0
)

const averageTimeDisplay = computed(() => {
  const time = props.metrics.averageTime
  if (time < 1000) {
    return `${Math.round(time)}ms`
  }
  return `${(time / 1000).toFixed(1)}s`
})
</script>
