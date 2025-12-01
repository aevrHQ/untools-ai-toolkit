import { IAIAgent, IAIProvider, AgentContext, AgentResult } from "../types";
import { ModelMessage } from "ai";

export abstract class BaseAgent<TInput = any, TOutput = any>
  implements IAIAgent<TInput, TOutput>
{
  abstract name: string;
  abstract description: string;
  provider: IAIProvider;

  constructor(provider: IAIProvider) {
    this.provider = provider;
  }

  abstract buildSystemPrompt(context?: AgentContext): string;

  /**
   * Convert input to messages for the AI provider
   */
  protected abstract buildMessages(
    input: TInput,
    context?: AgentContext
  ): ModelMessage[];

  /**
   * Parse AI response into agent output
   */
  protected abstract parseResponse(
    text: string,
    context?: AgentContext
  ): TOutput;

  /**
   * Get temperature for this agent
   */
  protected getTemperature(): number {
    return 0.7;
  }

  /**
   * Get max tokens for this agent
   */
  protected getMaxTokens(): number {
    return 1024;
  }

  /**
   * Validate input before execution
   */
  protected validateInput(input: TInput): { valid: boolean; error?: string } {
    return { valid: true };
  }

  async execute(
    input: TInput,
    context?: AgentContext
  ): Promise<AgentResult<TOutput>> {
    const startTime = Date.now();

    try {
      // Validate input
      const validation = this.validateInput(input);
      if (!validation.valid) {
        throw new Error(validation.error || "Invalid input");
      }

      // Build system prompt
      const systemPrompt = this.buildSystemPrompt(context);

      // Build messages from input
      const messages = this.buildMessages(input, context);

      // Generate text using provider
      const result = await this.provider.generateText({
        system: systemPrompt,
        messages,
        temperature: this.getTemperature(),
        maxTokens: this.getMaxTokens(),
      });

      // Parse response
      const output = this.parseResponse(result.text, context);

      const executionTime = Date.now() - startTime;

      return {
        success: true,
        data: output,
        usage: result.usage,
        metadata: {
          executionTime,
          provider: this.provider.name,
          ...(context?.metadata || {}),
        },
      };
    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      return {
        success: false,
        error: error.message || "Unknown error occurred",
        metadata: {
          executionTime,
          provider: this.provider.name,
        },
      };
    }
  }
}
