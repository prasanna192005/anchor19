import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { task, content, context } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "No content provided" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const MODEL = "gemini-3-flash-preview";
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

    let systemInstruction = "You are a highly efficient productivity assistant.";
    
    switch (task) {
      case "summarise":
        systemInstruction = "Summarize the text into 3-5 concise, high-impact bullet points. Use markdown. Result only.";
        break;
      case "email":
        systemInstruction = `Draft a professional email based on the provided content. Context: ${context || "Professional"}. Format as: Subject: ... \n\n Body: ... Result only.`;
        break;
      case "actions":
        systemInstruction = "Extract actionable tasks from the text and format them as a markdown checklist (- [ ] task). Result only.";
        break;
      case "refine":
        systemInstruction = `Refine the provided text based on this instruction: "${context}". Maintain the original markdown format if present. Result only.`;
        break;
      case "expand":
        systemInstruction = "Expand these brief points into a structured project brief or report. Result only.";
        break;
      default:
        systemInstruction = "Process the text as requested. Result only.";
    }

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: `${systemInstruction}\n\nContent: "${content}"` }],
          },
        ],
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData?.error?.message || "Gemini API Error" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const result = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";

    return NextResponse.json({ result });

  } catch (error: any) {
    console.error("AI Route Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
