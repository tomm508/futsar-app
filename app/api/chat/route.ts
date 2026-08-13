import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ text: "API Key Gemini belum diatur. Pastikan GEMINI_API_KEY sudah terpasang." }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const { message, history } = await req.json();
    
    let prompt = "Kamu adalah Asisten AI ramah khusus untuk Futsar Club (Futsal Club). Jawablah pertanyaan seputar futsal, taktik, atau sekadar obrolan santai yang memotivasi dengan gaya santai dan akrab. Jangan terlalu panjang, ringkas saja.\n\n";
    if (history && history.length > 0) {
      prompt += "Riwayat percakapan:\n";
      for (const msg of history) {
        prompt += `${msg.role === 'user' ? 'Member' : 'Kamu'}: ${msg.text}\n`;
      }
    }
    prompt += `Member: ${message}\nKamu:`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
    });
    
    return NextResponse.json({ text: response.text });
  } catch (error: any) {
    console.error("AI Error:", error);
    return NextResponse.json({ text: `Maaf, sistem AI sedang gangguan. Error: ${error.message || 'Unknown'}` }, { status: 500 });
  }
}
