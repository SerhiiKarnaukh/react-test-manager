import { z } from 'zod'
import { PROMPT_MAX_LENGTH } from '@features/ai-lab/api/ai-lab.models'

export const promptSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(1, 'Prompt is required')
    .max(PROMPT_MAX_LENGTH, `Maximum length is ${PROMPT_MAX_LENGTH} characters`),
})

export type PromptFormValues = z.infer<typeof promptSchema>
