import { IAIProvider } from "../types";
import { ModelMessage } from "ai";

export abstract class BaseAIProvider implements IAIProvider {
  abstract name: string;

  abstract generateText(params: {
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
  }>;

  abstract validate(): Promise<boolean>;
}
