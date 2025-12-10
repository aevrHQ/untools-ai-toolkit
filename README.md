# @untools/ai-toolkit

A reusable AI toolkit for creating providers and agents.

## Features

- **Multi-Provider Support**: Seamlessly switch between OpenAI, Anthropic, Groq, Google, and Vercel AI SDK.
- **Type-Safe Agents**: Create strongly typed AI agents with input validation and structured output.
- **Extensible Design**: Easy-to-extend `BaseAgent` class for building custom agents.
- **Built-in Agents**: Includes ready-to-use agents like `TitleGeneratorAgent`.

## Install

```bash
npm install @untools/ai-toolkit
```

## Usage

### Direct Provider

Use providers directly for simple text generation tasks.

```typescript
import { createProvider } from "@untools/ai-toolkit";

const provider = createProvider({
  provider: "openai", // or "anthropic", "groq", "google"
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4o",
});

const result = await provider.generateText({
  system: "You are helpful",
  messages: [{ role: "user", content: "Hello!" }],
});

console.log(result.text);
```

### Vercel SDK Integration

Leverage the power of Vercel AI SDK with a unified interface.

```typescript
import { createProvider } from "@untools/ai-toolkit";

const provider = createProvider({
  provider: "vercel",
  vercelModel: { type: "groq", model: "llama-3.1-8b-instant" },
  apiKey: process.env.GROQ_API_KEY,
});
```

### Using Built-in Agents

Use pre-built agents for common tasks.

```typescript
import { TitleGeneratorAgent } from "@untools/ai-toolkit";

const agent = new TitleGeneratorAgent({
  provider: "groq",
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.1-8b-instant",
});

const title = await agent.execute({
  messages: [{ role: "user", content: "Hello! How are you?" }],
});

console.log(title.data?.title);
```

## Creating Custom Agents

You can create your own agents by extending the `BaseAgent` class. This allows you to encapsulate prompt engineering, validation, and parsing logic.

### 1. Define Input and Output Types

Define the structure of the input your agent expects and the output it will return.

```typescript
interface MyAgentInput {
  topic: string;
  tone?: "serious" | "funny";
}

interface MyAgentOutput {
  joke: string;
  explanation: string;
}
```

### 2. Extend BaseAgent

Implement the required abstract methods: `buildSystemPrompt`, `buildMessages`, and `parseResponse`.

```typescript
import { BaseAgent, AgentContext, ModelMessage } from "@untools/ai-toolkit";

export class JokeAgent extends BaseAgent<MyAgentInput, MyAgentOutput> {
  name = "joke-generator";
  description = "Generates jokes based on a topic";

  // Optional: Override defaults
  protected getTemperature(): number {
    return 0.8;
  }

  buildSystemPrompt(context?: AgentContext): string {
    return `You are a comedian. Generate a joke and explain it.
    Return JSON format: { "joke": "...", "explanation": "..." }`;
  }

  protected buildMessages(
    input: MyAgentInput,
    context?: AgentContext
  ): ModelMessage[] {
    return [
      {
        role: "user",
        content: `Tell me a ${input.tone || "funny"} joke about ${input.topic}`,
      },
    ];
  }

  protected parseResponse(text: string, context?: AgentContext): MyAgentOutput {
    // Parse the JSON response from the LLM
    try {
      return JSON.parse(text);
    } catch (e) {
      return { joke: text, explanation: "Could not parse explanation" };
    }
  }
}
```

### 3. Use Your Agent

```typescript
const agent = new JokeAgent({
  provider: "openai",
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4o",
});

const result = await agent.execute({
  topic: "programmers",
  tone: "funny",
});

if (result.success) {
  console.log("Joke:", result.data.joke);
  console.log("Why it's funny:", result.data.explanation);
}
```
