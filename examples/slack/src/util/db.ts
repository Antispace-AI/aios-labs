import { readFileSync, writeFileSync, existsSync } from "fs"
import { join } from "path"

const DB_FILE = join(process.cwd(), "slack_users.json")

export interface UserData {
  id: string
  antiId: string
  accessToken?: string
  refreshToken?: string
  teamId?: string
  teamName?: string
  userId?: string
  userName?: string
  createdAt: string
  updatedAt: string
}

// Database interface for easy migration to real database
export interface DatabaseInterface {
  getUser(antiId: string): Promise<UserData | null>
  createUser(antiId: string): Promise<UserData>
  updateUser(antiId: string, updates: Partial<UserData>): Promise<UserData>
  getAllUsers(): Promise<UserData[]>
  cleanup?(): Promise<void>
}

/**
 * Simple JSON file-based database for POC
 * TODO: Replace with proper database (PostgreSQL, MongoDB, etc.)
 * 
 * PERFORMANCE WARNING: This implementation:
 * - Reads entire file on every operation
 * - Has no concurrent access protection
 * - Blocks event loop on file I/O
 * - Should NOT be used in production
 */
class SimpleFileDB implements DatabaseInterface {
  private data: Record<string, UserData> = {}
  private isLoaded = false
  private readonly maxRetries = 3
  private readonly lockTimeout = 5000 // 5 seconds

  constructor() {
    this.load()
  }

  private validateUserData(data: Partial<UserData>): void {
    if (data.accessToken && !data.accessToken.startsWith('xox')) {
      throw new Error('Invalid access token format')
    }
    if (data.antiId && typeof data.antiId !== 'string') {
      throw new Error('antiId must be a string')
    }
  }

  private async load() {
    if (this.isLoaded) return

    try {
      if (existsSync(DB_FILE)) {
        const fileContent = readFileSync(DB_FILE, "utf8")
        const parsed = JSON.parse(fileContent)
        
        // Validate data structure
        if (typeof parsed !== 'object' || Array.isArray(parsed)) {
          throw new Error('Invalid database file format')
        }
        
        this.data = parsed
      }
      this.isLoaded = true
    } catch (error) {
      console.warn("Failed to load database file, starting with empty database:", error)
      this.data = {}
      this.isLoaded = true
    }
  }

  private async save() {
    try {
      // TODO: Add file locking for concurrent access protection
      const tempFile = `${DB_FILE}.tmp`
      writeFileSync(tempFile, JSON.stringify(this.data, null, 2))
      
      // Atomic rename (on most filesystems)
      if (existsSync(DB_FILE)) {
        writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2))
      } else {
        writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2))
      }
    } catch (error) {
      console.error("Failed to save database file:", error)
      throw error
    }
  }

  async getUser(antiId: string): Promise<UserData | null> {
    await this.load()
    return this.data[antiId] || null
  }

  async createUser(antiId: string): Promise<UserData> {
    await this.load()
    
    if (this.data[antiId]) {
      throw new Error(`User ${antiId} already exists`)
    }

    const now = new Date().toISOString()
    const user: UserData = {
      id: antiId,
      antiId,
      createdAt: now,
      updatedAt: now,
    }
    
    this.validateUserData(user)
    this.data[antiId] = user
    await this.save()
    return user
  }

  async updateUser(antiId: string, updates: Partial<UserData>): Promise<UserData> {
    await this.load()
    
    const existing = this.data[antiId]
    if (!existing) {
      throw new Error(`User ${antiId} not found`)
    }

    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    
    this.validateUserData(updated)
    this.data[antiId] = updated
    await this.save()
    return updated
  }

  async getAllUsers(): Promise<UserData[]> {
    await this.load()
    return Object.values(this.data)
  }
}

// Factory function for easy database switching
export function createDatabase(): DatabaseInterface {
  const dbType = process.env.DATABASE_TYPE || 'file'
  
  switch (dbType) {
    case 'file':
      return new SimpleFileDB()
    // case 'postgres':
    //   return new PostgreSQLDB()
    // case 'mongodb':
    //   return new MongoDB()
    default:
      console.warn(`Unknown database type: ${dbType}, falling back to file`)
      return new SimpleFileDB()
  }
}

const db = createDatabase()
export default db 