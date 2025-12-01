# @untools/ai-toolkit

A reusable AI toolkit for creating providers and agents.

## Install

```bash
npm install @untools/ai-toolkit
```

## Usage

### Direct Provider

```typescript
import { createProvider } from "@untools/ai-toolkit";

const provider = createProvider({
  provider: "openai",
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4o",
});

const result = await provider.generateText({
  system: "You are helpful",
  messages: [{ role: "user", content: "Hello!" }],
});

console.log(result.text);
```

### Agents

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

### Vercel SDK Integration

```typescript
import { createProvider } from "@untools/ai-toolkit";

const provider = createProvider({
  provider: "vercel",
  vercelModel: { type: "groq", model: "llama-3.1-8b-instant" },
  apiKey: process.env.GROQ_API_KEY,
});
```
