import { BaseAIProvider } from "./base";
import { ModelMessage } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";

export class DirectAIProvider extends BaseAIProvider {
  name: string;
  private model: any;
  private apiKey: string;

  constructor(
    provider: "openai" | "anthropic" | "groq" | "google",
    apiKey: string,
    modelName: string
  ) {
    super();
    this.name = provider;
    this.apiKey = apiKey;

    switch (provider) {
      case "openai":
        const openai = createOpenAI({ apiKey });
        this.model = openai(modelName);
        break;
      case "anthropic":
        const anthropic = createAnthropic({ apiKey });
        this.model = anthropic(modelName);
        break;
      case "google":
        const google = createGoogleGenerativeAI({ apiKey });
        this.model = google(modelName);
        break;
      case "groq":
        const groq = createGroq({ apiKey });
        this.model = groq(modelName);
        break;
      default:
        throw new Error(`Unsupported direct provider: ${provider}`);
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
      messages: params.messages as any, // Type compatibility with ai SDK
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
    return !!this.apiKey;
  }
}
