import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const LANGS = ["en", "fr", "ar"] as const;
type Lang = typeof LANGS[number];

const LANG_NAMES: Record<Lang, string> = {
    en: "English",
    fr: "French",
    ar: "Arabic",
};

export async function POST(req: NextRequest) {
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

        // Detect which languages need translation (empty title OR empty content)
        const targetLangs = LANGS.filter(lang =>
            lang !== sourceLang &&
            (!title[lang]?.trim() || !content[lang]?.trim())
        );

        if (targetLangs.length === 0) {
            return NextResponse.json({ message: "All languages already filled.", title, content });
        }

        const sourceTitleText = title[sourceLang] || "";
        const sourceContentText = content[sourceLang] || "";
        const targetDescriptions = targetLangs.map(l => LANG_NAMES[l]).join(" and ");

        const systemPrompt = `You are an expert technical translator for an Arduino projects library.
Translate the given step title and step content into ${targetDescriptions}.

STRICT RULES:
1. DO NOT modify the source content — only translate it.
2. Technical keywords MUST remain in English in all languages: Arduino, Breadboard, GND, VCC, LED, Resistor, I2C, SPI, PWM, GPIO, Jumper wire, etc.
3. Preserve ALL markdown formatting exactly (**, *, \`code\`, ##, -, numbered lists, etc.).
4. Return ONLY a raw JSON object with NO preamble, NO markdown code blocks:
${JSON.stringify(
            Object.fromEntries([
                ...targetLangs.map(l => [`title_${l}`, `...translated title in ${LANG_NAMES[l]}...`]),
                ...targetLangs.map(l => [`content_${l}`, `...translated content in ${LANG_NAMES[l]}...`]),
            ])
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
            max_tokens: 2048,
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

        // Merge: keep existing values, fill only the translated ones
        const resultTitle = { ...title };
        const resultContent = { ...content };
        for (const lang of targetLangs) {
            if (!resultTitle[lang]?.trim() && translated[`title_${lang}`]) {
                resultTitle[lang] = translated[`title_${lang}`];
            }
            if (!resultContent[lang]?.trim() && translated[`content_${lang}`]) {
                resultContent[lang] = translated[`content_${lang}`];
            }
        }

        return NextResponse.json({ title: resultTitle, content: resultContent });

    } catch (error: any) {
        console.error("Error translating step:", error);
        if (error?.status === 429) {
            return NextResponse.json({ error: "Rate limit reached. Please wait a moment." }, { status: 429 });
        }
        return NextResponse.json({ error: "Translation failed. Please try again." }, { status: 500 });
    }
}
