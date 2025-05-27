/**
 * Request validation utilities
 */

export interface ValidationResult {
  isValid: boolean
  error?: string
}

export function validateRequest({ name, parameters, meta }: {
  name: string
  parameters: any
  meta: any
}): ValidationResult {
  console.log("👤 Meta data:", meta)
  console.log("🔍 Function name type:", typeof name)
  console.log("🔍 Function name length:", name?.length)
  
  if (!name || typeof name !== 'string') {
    return {
      isValid: false,
      error: "Function name is required and must be a string"
    }
  }

  if (name.length === 0) {
    return {
      isValid: false,
      error: "Function name cannot be empty"
    }
  }

  const userId = meta?.user?.id
  if (!userId) {
    return {
      isValid: false,
      error: "User ID not found in request metadata"
    }
  }

  return { isValid: true }
} 