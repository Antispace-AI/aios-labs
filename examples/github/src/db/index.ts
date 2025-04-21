//@ts-nocheck
const Redis = require("ioredis");

export const redis = new Redis(
	process.env.CACHE_REDIS_URL || "redis://localhost:6379",
);

module.exports = { redis };
