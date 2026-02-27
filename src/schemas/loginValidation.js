import z from 'zod'
import { ERROR_MESSAGES } from '../utils/errors.js'

const registerSchema = z.object({
  email: z.email({
    error: ERROR_MESSAGES.INVALID_EMAIL
  }),
  password: z.string({ message: ERROR_MESSAGES.INVALID_PASSWORD }).min(6, ERROR_MESSAGES.PASSWORD_TOO_SHORT).max(50, ERROR_MESSAGES.PASSWORD_TOO_LONG),
  categories: z.array(z.enum(['education', 'health', 'business', 'entertainment', 'lifestyle', 'politics', 'science', 'sports', 'technology'], { message: 'Incrrect categories' })).nonempty(ERROR_MESSAGES.MISSING_FIELDS)
})

const unregisterSchema = z.object({
  email: z.email({
    error: ERROR_MESSAGES.INVALID_EMAIL
  }),
  password: z.string({ message: ERROR_MESSAGES.INVALID_PASSWORD }).min(6, ERROR_MESSAGES.PASSWORD_TOO_SHORT).max(50, ERROR_MESSAGES.PASSWORD_TOO_LONG)
})

export const validateUserRegister = async (object) => {
  return registerSchema.safeParse(object)
}

export const validateUserUnregister = async (object) => {
  return unregisterSchema.safeParse(object)
}
