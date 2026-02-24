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
                    content: `You are an expert technical writer for an Arduino school projects library. The user provides a short project summary.

Your task is to generate:
1. A professional project title and description (EN, FR, AR).
2. Exactly 3 structured template steps for the project (EN, FR, AR each).

The 3 steps MUST always follow this fixed structure:
- Step 1 — Materials List: a bullet-point list of all components, quantities, and tools needed.
- Step 2 — Assembling: step-by-step wiring and assembly instructions.
- Step 3 — Arduino Code & Libraries: the full working Arduino code (in a code block) + list of libraries used.

STRICT RULES:
- Technical keywords stay in English across ALL languages: LED, GND, VCC, Breadboard, Resistor, Jumper wire, I2C, SPI, PWM, GPIO, Arduino, Serial Monitor, pinMode, digitalWrite, analogRead, etc.
- Return ONLY a valid JSON object with NO markdown, NO code blocks, NO extra text — just raw JSON.
- For Arduino code inside step 3 content, wrap it in a markdown code block using triple backticks with the language identifier \"arduino\".

JSON schema (follow exactly):
{
  "title_en": "...", "title_fr": "...", "title_ar": "...",
  "description_en": "...", "description_fr": "...", "description_ar": "...",
  "steps": [
    {
      "title_en": "Materials List", "title_fr": "...", "title_ar": "...",
      "content_en": "...", "content_fr": "...", "content_ar": "..."
    },
    {
      "title_en": "Assembling", "title_fr": "...", "title_ar": "...",
      "content_en": "...", "content_fr": "...", "content_ar": "..."
    },
    {
      "title_en": "Arduino Code & Libraries", "title_fr": "...", "title_ar": "...",
      "content_en": "...", "content_fr": "...", "content_ar": "..."
    }
  ]
}`
                },
                {
                    role: "user",
                    content: summary
                }
            ],
            temperature: 0.7,
            max_tokens: 3000,
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
