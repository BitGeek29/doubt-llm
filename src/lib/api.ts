import { PUBLIC_API_URL } from '$env/static/public';
import type { ChatMessage } from '$lib/types';


export async function generateResponse(
  chatHistory: ChatMessage[],
  signal: AbortSignal,
  systemInstruction?: string
) {
  const contents = [];
  let system_instruction = {};
  if (systemInstruction && systemInstruction.trim() !== "") {
    system_instruction = {parts: [{ text: systemInstruction }]};
  }


  contents.push(...chatHistory);

  const response = await fetch(PUBLIC_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents, system_instruction }),
    signal
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error.message);
  }

  return data.candidates[0].content.parts[0].text.replace(/\*\*([^*]+)\*\*/g, "$1").trim();
}
