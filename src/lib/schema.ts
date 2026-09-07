// Local zod view over the proto session row (the UI contract kept stable
// through the REST → Connect migration). Types that live in the proto now come
// from @easylab/sdk/agent instead.
import { z } from 'zod'

export const SessionRowSchema = z.object({
  name: z.string(),
  model: z.string(),
  preset: z.string(),
  tip_id: z.string().nullable(),
  max_turns: z.number().int(),
  system_prompt: z.string(),
  input_tokens: z.number().int(),
  output_tokens: z.number().int(),
  total_tokens: z.number().int(),
  last_input_tokens: z.number().int(),
  last_output_tokens: z.number().int(),
  created_at: z.string(),
  updated_at: z.string(),
  last_used_at: z.string().nullable(),
  locale: z.string().optional(),
})
export type SessionRow = z.infer<typeof SessionRowSchema>
export type SessionJson = SessionRow

/** Parsed SSE/watch event delta params, discriminated by event type. */
export const SseParamsSchema = z.union([
  z.object({ type: z.string() }),
  z.object({ text: z.string() }),
  z.object({ content: z.string() }),
  z.object({ message: z.string() }),
  z.object({ reason: z.string() }),
  z.object({ tool_use_id: z.string(), content: z.string() }),
  z.object({
    toolCallId: z.string(),
    toolName: z.string(),
    content: z.string(),
  }),
])

export interface CatalogProvider {
  id: string
  name: string
  api?: string
  npm: string
  env: string[]
  models: Record<string, unknown>
}
