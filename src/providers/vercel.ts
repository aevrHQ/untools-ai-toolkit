import { BaseAIProvider } from "./base";
import { ModelMessage } from "ai";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import { VercelModelConfig } from "../types";

export class VercelAIProvider extends BaseAIProvider {
  name = "vercel";
  private model: any;

  constructor(config: VercelModelConfig, apiKey?: string) {
    super();

    switch (config.type) {
      case "openai":
        const openai = createOpenAI({ apiKey });
        this.model = openai(config.model);
        break;
      case "anthropic":
        const anthropic = createAnthropic({ apiKey });
        this.model = anthropic(config.model);
        break;
      case "google":
        const google = createGoogleGenerativeAI({ apiKey });
        this.model = google(config.model);
        break;
      case "groq":
        const groq = createGroq({ apiKey });
        this.model = groq(config.model);
        break;
      default:
        throw new Error(
          `Unsupported Vercel model type: ${(config as any).type}`
        );
    }
  }

  async generateText(params: {
    system?: string;
    messages: ModelMessage[];
    temperature?: number;
    maxTokens?: number;
  }): Promise<{
    text: string;
    usage?: {
      inputTokens?: number;
      outputTokens?: number;
      totalTokens?: number;
    };
  }> {
    const result = await generateText({
      model: this.model,
      system: params.system,
      messages: params.messages as any,
      temperature: params.temperature,
      maxOutputTokens: params.maxTokens,
    });

    return {
      text: result.text,
      usage: result.usage
        ? {
            inputTokens:
              (result.usage as any).promptTokens ||
              (result.usage as any).inputTokens ||
              0,
            outputTokens:
              (result.usage as any).completionTokens ||
              (result.usage as any).outputTokens ||
              0,
            totalTokens: result.usage.totalTokens || 0,
          }
        : undefined,
    };
  }

  async validate(): Promise<boolean> {
    return true;
  }
}
