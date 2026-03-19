import { createError, defineEventHandler } from 'h3'
import { ref, computed, readonly } from 'vue'

// Make Nitro/H3 auto-imported globals available in the test environment
Object.assign(globalThis, { createError, defineEventHandler })

// Make Vue auto-imported globals available in the test environment
Object.assign(globalThis, { ref, computed, readonly })
