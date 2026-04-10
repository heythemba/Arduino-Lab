/**
 * Translation API for step-by-step project content.
 *
 * Receives multilingual title/content pairs and fills in any missing
 * language variants while preserving markdown syntax and technical terms.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";

const LANGS = ["en", "fr", "ar"] as const;
type Lang = typeof LANGS[number];

const LANG_NAMES: Record<Lang, string> = {
    en: "English",
    fr: "French",
    ar: "Arabic",
};

export const maxDuration = 60;

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized. You must be logged in to use this feature." }, { status: 401 });
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        return NextResponse.json({ error: "Groq API key is not configured." }, { status: 500 });
    }

    const client = new OpenAI({
        apiKey,
        baseURL: "https://api.groq.com/openai/v1",
    });

    try {
        const body = await req.json();
        const { title, content } = body as {
            title: Record<Lang, string>;
            content: Record<Lang, string>;
        };

        // Detect source language: the one with the most content filled
        const sourceLang = LANGS.find(lang => title[lang]?.trim() || content[lang]?.trim());
        if (!sourceLang) {
            return NextResponse.json({ error: "No source content found in any language." }, { status: 400 });
        }

        // Detect which FIELDS are missing across all languages
        // A field is missing if it's empty or not trimmed
        const missingFields = new Set<`title_${Lang}` | `content_${Lang}`>();
        
        for (const lang of LANGS) {
            if (!title[lang]?.trim()) {
                missingFields.add(`title_${lang}`);
            }
            if (!content[lang]?.trim()) {
                missingFields.add(`content_${lang}`);
            }
        }

        if (missingFields.size === 0) {
            return NextResponse.json({ message: "All fields already filled.", title, content });
        }

        const sourceTitleText = title[sourceLang] || "";
        const sourceContentText = content[sourceLang] || "";
        
        // Build list of missing fields for clarity
        const missingFieldsList = Array.from(missingFields)
            .map(f => {
                const [fieldType, lang] = f.split('_') as [string, Lang];
                return `${fieldType} in ${LANG_NAMES[lang]}`;
            })
            .join(', ');

        const systemPrompt = `You are an expert technical translator for an Arduino projects library.
Your task is to fill the missing fields by translating/generating content based on the source content provided.

Missing fields to fill: ${missingFieldsList}
Source content is in ${LANG_NAMES[sourceLang]}.

STRICT RULES:
1. DO NOT modify the source content — only translate it.
2. Technical keywords MUST remain in English in all languages: Arduino, Breadboard, GND, VCC, LED, Resistor, I2C, SPI, PWM, GPIO, Jumper wire, etc.
3. Preserve ALL markdown formatting exactly (**, *, \`code\`, ##, -, numbered lists, etc.).
4. Return ONLY a raw JSON object with NO preamble, NO markdown code blocks.
5. For each missing field, provide the translated/generated content.

Return this exact JSON structure:
${JSON.stringify(
            Object.fromEntries(
                Array.from(missingFields).map(f => [f, `...${f}...`])
            )
        )}`;

        const completion = await client.chat.completions.create({
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            messages: [
                { role: "system", content: systemPrompt },
                {
                    role: "user",
                    content: `Source language: ${LANG_NAMES[sourceLang]}

Title:
${sourceTitleText}

Content:
${sourceContentText}`
                }
            ],
            temperature: 0.3,
            max_tokens: 4096,
        });

        const rawText = completion.choices[0]?.message?.content || "";

        // Extract the JSON block robustly
        let cleanJson = rawText.trim();
        if (cleanJson.includes("```json")) {
            cleanJson = cleanJson.replace(/```json\n?/g, "").replace(/\n?```/g, "");
        } else if (cleanJson.includes("```")) {
            cleanJson = cleanJson.replace(/```\n?/g, "");
        }
        const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error("No JSON in translate-step response:", rawText);
            return NextResponse.json({ error: "Could not parse translation response." }, { status: 500 });
        }

        const translated = JSON.parse(jsonMatch[0]);

        // Merge: keep existing values, fill only the missing ones
        const resultTitle: Record<Lang, string> = { ...title };
        const resultContent: Record<Lang, string> = { ...content };
        
        for (const field of missingFields) {
            if (field.startsWith('title_')) {
                const lang = field.slice(6) as Lang;
                if (translated[field]?.trim()) {
                    resultTitle[lang] = translated[field];
                }
            } else if (field.startsWith('content_')) {
                const lang = field.slice(8) as Lang;
                if (translated[field]?.trim()) {
                    resultContent[lang] = translated[field];
                }
            }
        }

        return NextResponse.json({ title: resultTitle, content: resultContent });

    } catch (error) {
        console.error("Error translating step:", error);
        const errObj = error as { status?: number };
        if (errObj?.status === 429) {
            return NextResponse.json({ error: "Rate limit reached. Please wait a moment." }, { status: 429 });
        }
        return NextResponse.json({ error: "Translation failed. Please try again." }, { status: 500 });
    }
}
