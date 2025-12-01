import { AIProviderConfig, IAIProvider } from "../types";
import { DirectAIProvider } from "./direct";
import { VercelAIProvider } from "./vercel";

export function createProvider(config: AIProviderConfig): IAIProvider {
  if (config.provider === "vercel") {
    if (!config.vercelModel) {
      throw new Error("vercelModel config is required for 'vercel' provider");
    }
    return new VercelAIProvider(config.vercelModel, config.apiKey);
  }

  if (
    config.provider === "openai" ||
    config.provider === "anthropic" ||
    config.provider === "groq" ||
    config.provider === "google"
  ) {
    if (!config.model) {
      throw new Error(
        `Model name is required for '${config.provider}' provider`
      );
    }
    if (!config.apiKey) {
      // In some cases apiKey might be optional if set in env vars, but let's enforce or warn?
      // For now, pass it through, the SDK might pick up env vars.
      // But DirectAIProvider expects it in constructor.
      // Let's assume process.env is handled by the caller or we can fallback here if we want.
      // For this implementation, we'll require it or pass undefined if the SDK supports it.
      // The DirectAIProvider constructor expects string.
      // Let's try to read from env if not provided.
    }

    const apiKey =
      config.apiKey ||
      process.env[`${config.provider.toUpperCase()}_API_KEY`] ||
      "";

    return new DirectAIProvider(config.provider, apiKey, config.model);
  }

  throw new Error(`Unsupported provider: ${config.provider}`);
}
