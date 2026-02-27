export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  DELETED: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
}

export const ERROR_MESSAGES = {
  INVALID_EMAIL: 'Invalid email',
  EMAIL_EXISTS: 'Email is already registered',
  USER_EXISTS: 'User already exists',
  USER_NOT_FOUND: 'User not found',
  INVALID_PASSWORD: 'Incorrect password',
  PASSWORD_TOO_SHORT: 'Password is too short',
  PASSWORD_TOO_LONG: 'Password is too long',
  INVALID_CATEGORIES: 'Invalid categories',
  MISSING_FIELDS: 'Required fields are missing',
  INTERNAL_ERROR: 'The server is currently unavailable. Please try again later',
  INVALID_CREDENTIALS: 'Invalid credentials',
  UNAUTHORIZED: 'Unauthorized',
  INVALID_TOKEN: 'Invalid Token',
  EXPIRED_TOKEN: 'Expired Token'
}

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE_EMAIL: 'DUPLICATE_EMAIL',
  DATABASE_ERROR: 'DATABASE_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED'
}
