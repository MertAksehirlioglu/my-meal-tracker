import { defineEventHandler, readBody, setResponseHeader } from 'h3'
import { nutritionDatabase, mapToFoodItem } from '~/lib/nutrition-database'

export type AnalysisStep = 'classifying' | 'enriching' | 'done'

export interface StreamEvent {
  step: AnalysisStep
  result?: {
    foodName: string
    confidence: number
    nutrition: {
      calories: number
      protein: number
      carbs: number
      fat: number
      fiber: number
    }
    portionSize: string
  }
}

// eslint-disable-next-line no-restricted-syntax
export default defineEventHandler(async (event) => {
  const body = await readBody<{ label?: string; confidence?: number }>(event)
  const label = body?.label ?? 'mixed meal'
  const confidence = body?.confidence ?? 0.8

  setResponseHeader(event, 'Content-Type', 'text/event-stream')
  setResponseHeader(event, 'Cache-Control', 'no-cache')
  setResponseHeader(event, 'Connection', 'keep-alive')
  setResponseHeader(event, 'X-Accel-Buffering', 'no')

  const res = event.node.res

  const sendEvent = (data: StreamEvent) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`)
  }

  sendEvent({ step: 'classifying' })
  await new Promise((r) => setTimeout(r, 450))

  sendEvent({ step: 'enriching' })
  await new Promise((r) => setTimeout(r, 300))

  const mappedFood = mapToFoodItem(label)
  const nutrition = nutritionDatabase[mappedFood] ?? {
    calories: 300,
    protein: 15,
    carbs: 35,
    fat: 12,
    fiber: 3,
  }

  const foodName = label
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim()

  sendEvent({
    step: 'done',
    result: {
      foodName,
      confidence,
      nutrition,
      portionSize: 'Medium serving',
    },
  })

  res.end()
})
