import { createProvider, TitleGeneratorAgent } from "./src";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("Testing @untools/ai-toolkit...");

  // Mock API Key for testing if not present (this will fail actual calls but verify structure)
  const mockApiKey = "sk-mock-key";

  try {
    // 1. Test Direct Provider Instantiation
    console.log("1. Testing Direct Provider...");
    const provider = createProvider({
      provider: "openai",
      apiKey: process.env.OPENAI_API_KEY || mockApiKey,
      model: "gpt-4o",
    });
    console.log("   Provider created:", provider.name);

    // 2. Test Agent Instantiation
    console.log("2. Testing Agent...");
    const agent = new TitleGeneratorAgent({
      provider: "openai", // Using openai for test
      apiKey: process.env.OPENAI_API_KEY || mockApiKey,
      model: "gpt-4o",
    });
    console.log("   Agent created:", agent.name);

    // 3. Test Vercel Provider Instantiation
    console.log("3. Testing Vercel Provider...");
    const vercelProvider = createProvider({
      provider: "vercel",
      vercelModel: { type: "openai", model: "gpt-4o" },
      apiKey: process.env.OPENAI_API_KEY || mockApiKey,
    });
    console.log("   Vercel Provider created:", vercelProvider.name);

    console.log("All instantiation tests passed!");

    // Note: Actual API calls would require valid keys.
    // We can uncomment the following to run real calls if keys are present.
    /*
    if (process.env.OPENAI_API_KEY) {
        console.log("Running live test...");
        const result = await agent.execute({
            messages: [{ role: "user", content: "Hello world" }]
        });
        console.log("Live result:", result);
    }
    */
  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
}

main();
