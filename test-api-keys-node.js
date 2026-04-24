#!/usr/bin/env node

// Simple Node.js script to test AI API keys locally
// Run with: node test-api-keys-node.js

import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { anthropic } from '@ai-sdk/anthropic';

async function testProvider(providerName, apiKey, model) {
  console.log(`\n🧪 Testing ${providerName}...`);
  console.log(`API Key: ${apiKey.substring(0, 10)}...`);
  console.log(`Model: ${model}`);

  try {
    let provider;

    switch (providerName) {
      case 'openai':
        provider = openai(model, { apiKey });
        break;
      case 'gemini':
        // Set environment variable for Google Generative AI SDK
        process.env.GOOGLE_GENERATIVE_AI_API_KEY = apiKey;
        provider = google(model);
        break;
      case 'anthropic':
        // Set environment variable for Anthropic SDK
        process.env.ANTHROPIC_API_KEY = apiKey;
        provider = anthropic(model);
        break;
      default:
        throw new Error(`Unknown provider: ${providerName}`);
    }

    console.log('Making API call...');
    const response = await generateText({
      model: provider,
      prompt: 'Say "Hello World" and nothing else.',
      temperature: 0,
      maxTokens: 50
    });

    console.log('✅ Success!');
    console.log('Response:', response.text);
    return true;

  } catch (error) {
    console.error('❌ Failed!');
    console.error('Error:', error.message);

    if (error.message.includes('401')) {
      console.error('→ API key is invalid or expired');
    } else if (error.message.includes('403')) {
      console.error('→ API key does not have permission');
    } else if (error.message.includes('429')) {
      console.error('→ Rate limit exceeded');
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      console.error('→ Network connectivity issue');
    }

    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.log('Usage: node test-api-keys-node.js <provider> <api-key> <model>');
    console.log('');
    console.log('Examples:');
    console.log('  node test-api-keys-node.js openai sk-your-key-here gpt-4o-mini');
    console.log('  node test-api-keys-node.js anthropic sk-ant-your-key-here claude-3-5-haiku-20241022');
    console.log('  node test-api-keys-node.js gemini AI-your-key-here gemini-1.5-flash');
    console.log('');
    console.log('Available models:');
    console.log('  OpenAI: gpt-4o, gpt-4o-mini');
    console.log('  Anthropic: claude-3-5-sonnet-20241022, claude-3-5-haiku-20241022');
    console.log('  Gemini: gemini-1.5-pro, gemini-2.0-flash-exp');
    return;
  }

  const [provider, apiKey, model] = args;
  await testProvider(provider, apiKey, model);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { testProvider };