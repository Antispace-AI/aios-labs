import { Redis } from "ioredis";

const db = new Redis(process.env.CACHE_REDIS_URL || "redis://localhost:6379");

export default db;
