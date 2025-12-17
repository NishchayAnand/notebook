import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

import OpenAI from "openai";
const client = new OpenAI();
const MODEL = "gpt-5-nano";

const redis = Redis.fromEnv();
const DAILY_LIMIT = 20;

const MAX_TOKENS = 300;

function dailyKey(sessionId: string) {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return `ai:daily:${sessionId}:${today}`;
}

export async function POST(req: Request) {
    try {
        // 🔴 Kill switch
        if (process.env.AI_ENABLED !== "true") {
        return NextResponse.json(
            { error: "AI is temporarily disabled" },
            { status: 503 }
        );
        }

        const sessionId = req.headers.get("x-session-id") ?? "anonymous";

        const { messages } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json(
                { error: "messages is required" },
                { status: 400 }
            );
        }

        // 🟡 Daily limit
        const key = dailyKey(sessionId);
        const count = await redis.incr(key);

        if (count === 1) {
            await redis.expire(key, 60 * 60 * 24); // 24h
        }

        if (count > DAILY_LIMIT) {
            return NextResponse.json(
                {
                error: "Daily limit reached",
                message: "You can send only 10 AI messages per day.",
                },
                { status: 429 }
            );
        }

        // 🧠 OpenAI call
        const response = await client.responses.create({
            model: MODEL,
            input: [
                {
                    role: "developer",
                    content: "Give small and concise outputs."
                },
                ...messages
            ],
        });

        if (response.error) {
            return NextResponse.json(
                { error: response.error },
                { status: 400 }
            );
        }

        return NextResponse.json({
            reply: response.output_text,
            remaining: DAILY_LIMIT - count,
        });
        
    } catch (err) {
        console.error("AI error:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}