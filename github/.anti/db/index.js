"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
//@ts-nocheck
const Redis = require("ioredis");
exports.redis = new Redis(process.env.CACHE_REDIS_URL || "redis://localhost:6379");
module.exports = { redis: exports.redis };
