import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        return NextResponse.json({ error: "Groq API key is not configured. Please restart your dev server after adding GROQ_API_KEY to .env.local" }, { status: 500 });
    }

    const client = new OpenAI({
        apiKey,
        baseURL: "https://api.groq.com/openai/v1",
    });

    try {
        const body = await req.json();
        const { summary } = body;

        if (!summary) {
            return NextResponse.json({ error: "Summary is required" }, { status: 400 });
        }

        const completion = await client.chat.completions.create({
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            messages: [
                {
                    role: "system",
                    content: `You are an expert technical translator and writer for an Arduino projects library.
The user will provide a short summary of an Arduino/electronics project.
Your task is to expand it into a professional title and description, then translate into English, French, and Arabic.

STRICT RULES:
1. Technical keywords MUST remain in English across ALL languages. Examples: Breadboard, GND, VCC, Arduino, LED, Resistor, Jumper wire, I2C, SPI, PWM, GPIO.
2. Return ONLY a valid JSON object with NO markdown formatting, NO code blocks, NO extra text — just the raw JSON:
{"title_en":"...","title_fr":"...","title_ar":"...","description_en":"...","description_fr":"...","description_ar":"..."}`
                },
                {
                    role: "user",
                    content: summary
                }
            ],
            temperature: 0.7,
            max_tokens: 1024,
        });

        const text = completion.choices[0]?.message?.content || "";

        // Extract JSON object robustly - model may include preamble text
        let cleanJson = text.trim();
        // Strip markdown code blocks if present
        if (cleanJson.includes("```json")) {
            cleanJson = cleanJson.replace(/```json\n?/g, "").replace(/\n?```/g, "");
        } else if (cleanJson.includes("```")) {
            cleanJson = cleanJson.replace(/```\n?/g, "");
        }
        // Find the first { ... } block in case there's preamble text
        const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error("No JSON found in response:", cleanJson);
            return NextResponse.json({ error: "Could not parse AI response. Please try again." }, { status: 500 });
        }

        const parsedJson = JSON.parse(jsonMatch[0]);
        return NextResponse.json(parsedJson);

    } catch (error: any) {
        console.error("Error generating content:", error);

        if (error?.status === 429) {
            return NextResponse.json({ error: "Rate limit reached. Please wait a moment and try again." }, { status: 429 });
        }

        return NextResponse.json({ error: "Failed to generate content. Please try again later." }, { status: 500 });
    }
}
