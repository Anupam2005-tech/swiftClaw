import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { ENV_PATH, getOpenRouterKey } from "../utils/config.ts";

export function getAgentModel() {
  const apiKey = getOpenRouterKey();
  if (!apiKey) {
    throw new Error(
      `OpenRouter API key is missing. Set OPENROUTER_API_KEY in ${ENV_PATH} or run swiftclaw to configure.`,
    );
  }
  const provider = createOpenRouter({ apiKey });
  const modelId = process.env.OPENROUTER_DEFAULT_MODEL;
  return provider(modelId || "google/gemini-2.5-pro");
}
