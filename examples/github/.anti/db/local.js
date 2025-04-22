"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = require("ioredis");
const db = new ioredis_1.Redis(process.env.CACHE_REDIS_URL || "redis://localhost:6379");
exports.default = db;
