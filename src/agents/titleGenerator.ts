import { BaseAgent } from "./base";
import {
  IAIProvider,
  AgentContext,
  TitleGenerationInput,
  TitleGenerationOutput,
  AIProviderConfig,
} from "../types";
import { createProvider } from "../providers";
import { ModelMessage } from "ai";

export class TitleGeneratorAgent extends BaseAgent<
  TitleGenerationInput,
  TitleGenerationOutput
> {
  name = "title-generator";
  description =
    "Generates short, descriptive titles for chat conversations (3-6 words)";

  // Configuration
  private readonly MAX_MESSAGES_TO_ANALYZE = 3;
  private readonly DEFAULT_MAX_LENGTH = 200;
  private readonly MIN_WORDS = 3;
  private readonly MAX_WORDS = 6;

  constructor(configOrProvider: AIProviderConfig | IAIProvider) {
    let provider: IAIProvider;
    if ("generateText" in configOrProvider) {
      provider = configOrProvider;
    } else {
      provider = createProvider(configOrProvider);
    }
    super(provider);
  }

  buildSystemPrompt(context?: AgentContext): string {
    return `You are a helpful assistant that generates short, descriptive titles for chat conversations.

REQUIREMENTS:
- Title must be ${this.MIN_WORDS}-${this.MAX_WORDS} words long
- Title must be at most ${this.DEFAULT_MAX_LENGTH} characters
- Do NOT use quotes around the title
- Do NOT use prefixes like "Chat with...", "Conversation about...", "Discussion on..."
- Use title case (capitalize main words)
- Be specific and descriptive based on the actual content
- Do NOT make assumptions or add information not present in the conversation

IMPORTANT:
- If it's just a simple greeting (like "hello", "hi there"), respond with "Casual Greeting"
- If the topic is unclear, respond with "General Discussion"
- Base the title ONLY on what was actually discussed

EXAMPLES:
✓ Good: "Baking a Chocolate Cake"
✓ Good: "React useEffect Hook Help"
✓ Good: "Travel Plans to Paris"
✓ Good: "Python List Comprehension Syntax"
✗ Bad: "Chat with User about Baking"
✗ Bad: "A Conversation about React"
✗ Bad: "Discussion on Travel"

Return ONLY the title text, nothing else.`;
  }

  protected buildMessages(
    input: TitleGenerationInput,
    context?: AgentContext
  ): ModelMessage[] {
    // Only use the first few messages to save tokens
    const messagesToAnalyze = input.messages.slice(
      0,
      this.MAX_MESSAGES_TO_ANALYZE
    );

    // Format messages for context
    const conversationContext = messagesToAnalyze
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join("\n\n");

    // Add additional context if provided
    let prompt = `Generate a title for this conversation:\n\n${conversationContext}`;

    if (input.context) {
      prompt += `\n\nAdditional context: ${input.context}`;
    }

    return [
      {
        role: "user",
        content: prompt,
      },
    ];
  }

  protected parseResponse(
    text: string,
    context?: AgentContext
  ): TitleGenerationOutput {
    // Clean the response
    let title = text
      .trim()
      .replace(/^["']|["']$/g, "") // Remove surrounding quotes
      .replace(/^(chat with|conversation about|discussion on)\s+/i, "") // Remove prefixes
      .trim();

    // Ensure it's not empty
    if (!title || title.length === 0) {
      title = "New Chat";
    }

    // Truncate if too long
    const maxLength = this.DEFAULT_MAX_LENGTH;
    if (title.length > maxLength) {
      title = title.substring(0, maxLength - 3).trim() + "...";
    }

    // Calculate confidence based on title quality
    const confidence = this.calculateConfidence(title);

    return {
      title,
      confidence,
    };
  }

  private calculateConfidence(title: string): number {
    let score = 1.0;

    const wordCount = title.split(/\s+/).length;
    const charCount = title.length;

    // Penalize if outside ideal word range
    if (wordCount < this.MIN_WORDS || wordCount > this.MAX_WORDS) {
      score -= 0.2;
    }

    // Penalize very short titles
    if (charCount < 10) {
      score -= 0.3;
    }

    // Penalize default/generic titles
    if (
      title === "New Chat" ||
      title.toLowerCase().includes("general discussion") ||
      title.toLowerCase().includes("casual greeting")
    ) {
      score -= 0.4;
    }

    // Penalize if it still has prefix patterns
    if (/^(chat|conversation|discussion)/i.test(title)) {
      score -= 0.2;
    }

    return Math.max(0, Math.min(1, score));
  }

  protected validateInput(input: TitleGenerationInput): {
    valid: boolean;
    error?: string;
  } {
    if (!input.messages || input.messages.length === 0) {
      return {
        valid: false,
        error: "At least one message is required to generate a title",
      };
    }

    const hasContent = input.messages.some(
      (msg) => msg.content && msg.content.trim().length > 0
    );

    if (!hasContent) {
      return {
        valid: false,
        error: "Messages must contain actual content",
      };
    }

    return { valid: true };
  }

  protected getTemperature(): number {
    return 0.5;
  }

  protected getMaxTokens(): number {
    return 50;
  }
}
