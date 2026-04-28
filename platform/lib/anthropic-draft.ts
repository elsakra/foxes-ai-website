import Anthropic from "@anthropic-ai/sdk";

const model = "claude-3-5-sonnet-20241022";

export type DraftOutput = {
  heroHeadline: string;
  heroSubhead: string;
  services: { title: string; body: string }[];
  about: string;
  cta: string;
};

export async function generateSiteDraft(intake: Record<string, unknown>): Promise<DraftOutput> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY is not set");
  const client = new Anthropic({ apiKey: key });
  const msg = await client.messages.create({
    model,
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `You are a senior copywriter for local business websites. Given this JSON intake from a kickoff call, output ONLY valid JSON with keys: heroHeadline, heroSubhead, services (array of {title, body} max 5), about (string), cta (string). Warm, specific, no lorem ipsum.\n\nINTAKE:\n${JSON.stringify(intake, null, 2)}`,
      },
    ],
  });
  let textOut = "";
  for (const b of msg.content) {
    if (b.type === "text") {
      textOut += b.text;
    }
  }
  const jsonMatch = textOut.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Claude did not return JSON");
  return JSON.parse(jsonMatch[0]) as DraftOutput;
}
