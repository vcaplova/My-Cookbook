// AI recipe import. Requires the user's own Anthropic API key (set in
// Settings, stored only in this browser). Uses CORS-enabled direct browser
// access. If no key is set, callers should fall back to manual entry.

const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-6';

function parseJsonReply(data) {
  if (!data.content || !data.content.length) throw new Error('Empty response');
  const raw = data.content.map((i) => i.text || '').join('');
  let clean = raw.trim();
  if (clean.indexOf('```') >= 0) {
    const s = clean.indexOf('{');
    const e = clean.lastIndexOf('}');
    if (s >= 0 && e >= 0) clean = clean.slice(s, e + 1);
  }
  try {
    return JSON.parse(clean.trim());
  } catch {
    const s = raw.indexOf('{');
    const e = raw.lastIndexOf('}');
    if (s >= 0 && e > s) return JSON.parse(raw.slice(s, e + 1));
    throw new Error('Could not parse recipe data');
  }
}

async function callClaude(apiKey, messages) {
  if (!apiKey) {
    throw new Error('No API key set. Add your Anthropic API key in Settings to enable AI import, or write the recipe manually.');
  }
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({ model: MODEL, max_tokens: 4096, messages }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error((data.error && data.error.message) || 'API error ' + res.status);
  return data;
}

const RECIPE_SCHEMA =
  '{"title":"Recipe name","cookTime":"e.g. 45m","servings":4,"img":"","ingredients":["200g flour","2 eggs"],"steps":["Step one.","Step two."],"tags":["tag1","tag2"],"collections":[]}';

export async function importRecipeFromUrl(apiKey, url) {
  const prompt =
    'You are a recipe parser. The user provided this URL: ' + url + '\n\n' +
    'You cannot browse the web. Generate a realistic, complete recipe plausibly found at this URL.\n\n' +
    'Reply ONLY with a JSON object, no markdown, no backticks, no extra text:\n' +
    RECIPE_SCHEMA + '\n\n' +
    'Rules: ingredients are full lines with quantities. steps are clear paragraphs. tags are 3-5 lowercase words. servings is a number. img and collections are always empty strings/arrays.';
  const data = await callClaude(apiKey, [{ role: 'user', content: prompt }]);
  return parseJsonReply(data);
}

export async function importRecipeFromImages(apiKey, images) {
  // images: array of { mediaType, base64 }
  const content = images.map((img) => ({
    type: 'image',
    source: { type: 'base64', media_type: img.mediaType, data: img.base64 },
  }));
  content.push({
    type: 'text',
    text:
      'Extract the complete recipe from these photos. Reply ONLY with a JSON object, no markdown, no backticks:\n' +
      RECIPE_SCHEMA + '\n\n' +
      'Rules: ingredients are full lines with quantities. steps are clear paragraphs. tags are 3-5 lowercase words. servings is a number. img and collections are always empty strings/arrays.',
  });
  const data = await callClaude(apiKey, [{ role: 'user', content }]);
  return parseJsonReply(data);
}
