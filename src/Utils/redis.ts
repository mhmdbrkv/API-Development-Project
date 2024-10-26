import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

const redisUrl = process.env.UPSTASH_REDIS_URL;
if (!redisUrl) {
  throw new Error("UPSTASH_REDIS_URL is not set");
}

const redis = new Redis(redisUrl);

export default redis;

export const storeRefreshToken = async (
  userId: string,
  refreshToken: string
) => {
  await redis.set(
    `refresh_token:${userId}`,
    refreshToken,
    "EX",
    15 * 24 * 60 * 60 // 15 days
  );
};

export const getRefreshToken = async (userId: string) => {
  return await redis.get(`refresh_token:${userId}`);
};

export const removeRefreshToken = async (userId: string) => {
  await redis.del(`refresh_token:${userId}`);
};
