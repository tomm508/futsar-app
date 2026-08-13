import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();
    
    let prompt = "Kamu adalah Asisten AI ramah khusus untuk Futsar Club (Futsal Club). Jawablah pertanyaan seputar futsal, taktik, atau sekadar obrolan santai yang memotivasi dengan gaya santai dan akrab.\n\n";
    if (history && history.length > 0) {
      prompt += "Riwayat percakapan:\n";
      for (const msg of history) {
        prompt += `${msg.role === 'user' ? 'Member' : 'Kamu'}: ${msg.text}\n`;
      }
    }
    prompt += `Member: ${message}\nKamu:`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });
    
    return NextResponse.json({ text: response.text });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ text: "Maaf, sistem AI sedang gangguan. Coba lagi nanti ya." }, { status: 500 });
  }
}
