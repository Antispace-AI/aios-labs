/**
 * Structured logging utility
 * Replaces console.log calls with proper logging levels and structured output
 */

import { LOG_LEVEL, IS_PRODUCTION } from '../config/simple'

export interface LogContext {
  userId?: string
  functionName?: string
  requestId?: string
  [key: string]: any
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

class Logger {
  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    }
    
    return levels[level] >= levels[LOG_LEVEL as LogLevel]
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const emoji = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
    }[level]

    const baseLog = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...context,
    }

    if (!IS_PRODUCTION) {
      return `${emoji} [${level.toUpperCase()}] ${message}${context ? ` | ${JSON.stringify(context)}` : ''}`
    }

    return JSON.stringify(baseLog)
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', message, context))
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('info', message, context))
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, context))
    }
  }

  error(message: string, error?: Error, context?: LogContext): void {
    if (this.shouldLog('error')) {
      const errorContext = {
        ...context,
        error: error ? {
          name: error.name,
          message: error.message,
          stack: !IS_PRODUCTION ? error.stack : undefined,
        } : undefined,
      }
      console.error(this.formatMessage('error', message, errorContext))
    }
  }

  // Performance logging
  time(label: string): void {
    if (this.shouldLog('debug')) {
      console.time(label)
    }
  }

  timeEnd(label: string): void {
    if (this.shouldLog('debug')) {
      console.timeEnd(label)
    }
  }

  // Create child logger with default context
  child(defaultContext: LogContext): Logger {
    const childLogger = new Logger()
    const originalMethods = {
      debug: childLogger.debug.bind(childLogger),
      info: childLogger.info.bind(childLogger),
      warn: childLogger.warn.bind(childLogger),
      error: childLogger.error.bind(childLogger),
    }

    childLogger.debug = (message: string, context?: LogContext) =>
      originalMethods.debug(message, { ...defaultContext, ...context })
    
    childLogger.info = (message: string, context?: LogContext) =>
      originalMethods.info(message, { ...defaultContext, ...context })
    
    childLogger.warn = (message: string, context?: LogContext) =>
      originalMethods.warn(message, { ...defaultContext, ...context })
    
    childLogger.error = (message: string, error?: Error, context?: LogContext) =>
      originalMethods.error(message, error, { ...defaultContext, ...context })

    return childLogger
  }
}

export const logger = new Logger()

// Convenience function for creating request-scoped loggers
export function createRequestLogger(userId: string, functionName?: string): Logger {
  return logger.child({
    userId,
    functionName,
    requestId: generateRequestId(),
  })
}

function generateRequestId(): string {
  return Math.random().toString(36).substr(2, 9)
} 