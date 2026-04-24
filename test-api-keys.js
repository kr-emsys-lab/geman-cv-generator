// Test script for AI API keys - run this in browser console
// Copy and paste this into the browser console when testing locally

async function testAPIKey(provider, apiKey, model) {
  console.log(`Testing ${provider} API key...`);

  try {
    let response;

    switch (provider) {
      case 'openai':
        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: model || 'gpt-4o-mini',
            messages: [{ role: 'user', content: 'Hello' }],
            max_tokens: 10
          })
        });
        break;

      case 'anthropic':
        response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: model || 'claude-3-5-haiku-20241022',
            max_tokens: 10,
            messages: [{ role: 'user', content: 'Hello' }]
          })
        });
        break;

      case 'gemini':
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-1.5-flash'}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: 'Hello' }]
            }]
          })
        });
        break;

      default:
        throw new Error('Unknown provider');
    }

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ ${provider} API key is valid!`);
      console.log('Response:', data);
      return true;
    } else {
      const error = await response.text();
      console.error(`❌ ${provider} API key validation failed:`);
      console.error('Status:', response.status);
      console.error('Error:', error);
      return false;
    }

  } catch (error) {
    console.error(`❌ ${provider} API call failed:`, error);
    return false;
  }
}

// Usage examples:
// testAPIKey('openai', 'your-openai-key-here', 'gpt-4o-mini') // CORS blocked - use Node.js
// testAPIKey('anthropic', 'your-anthropic-key-here', 'claude-3-5-haiku-20241022') // CORS blocked - use Node.js
// testAPIKey('gemini', 'your-gemini-key-here', 'gemini-1.5-pro') // Works in browser

console.log('API Key Test Functions Loaded!');
console.log('Note: Only Gemini works in browser due to CORS. Use Node.js for OpenAI/Anthropic.');
console.log('Use testAPIKey(provider, apiKey, model) to test your keys');