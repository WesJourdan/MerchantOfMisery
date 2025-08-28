import OpenAI from 'openai';
import { nameCraftedItemPrompt } from './nameCraftedItemPrompt.js';
import { randomJunkPrompt } from './randomJunkPrompt.js';
import { shopkeeperWelcomePrompt } from './shopkeeperWelcomePrompt.js';
import config from 'config'

const OPENAI_API_KEY = config.get('externalApis.openai.apiKey');

/**
 * Single OpenAI client instance (env: OPENAI_API_KEY)
 */
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

/**
 * Map our short-hand reasoning flag to the API's expected values.
 * 'min' -> 'minimal', 'low'|'med'|'high' pass-through when sensible.
 */
function mapReasoning(reasoning) {
  if(!reasoning) return undefined;
  if(reasoning === 'min') return 'minimal';
  return reasoning;
}

/**
 * Coerce content to a string for Chat API. If it's an object/array, stringify it.
 */
function toTextContent(content) {
  if(content == null) return '';
  if(typeof content === 'string') return content;
  try {
    return JSON.stringify(content, null, 2);
  } catch {
    return String(content);
  }
}

/**
 * Build a messages array from a prompt config and an optional user payload.
 * Supports few-shot examples defined in prompt.messages.
 *
 * @param {Object} promptCfg - { developerMessage, messages }
 * @param {any} userPayload  - optional content appended as a final user message
 * @returns {Array<{role: 'developer'|'user'|'assistant', content: string}>}
 */
function buildMessages(promptCfg, userPayload) {
  const msgs = [];

  // Primary developer instruction
  if(promptCfg.developerMessage) {
    msgs.push({
      role: 'developer',
      content: toTextContent(promptCfg.developerMessage),
    });
  }

  // Optional few-shot messages
  if(Array.isArray(promptCfg.messages)) {
    for(const m of promptCfg.messages) {
      msgs.push({
        role: m.role,
        content: toTextContent(m.content),
      });
    }
  }

  // Optional user payload (e.g., itemDTO)
  if(userPayload !== undefined) {
    msgs.push({
      role: 'user',
      content: toTextContent(userPayload),
    });
  }

  return msgs;
}

/**
 * Generic JSON-typed completion runner for our prompt configs.
 * Keeps our three endpoints (name item, junk list, welcome line) DRY.
 *
 * @param {Object} promptCfg - One of the imported prompt configs
 * @param {any} [userPayload] - Optional content for the final user message
 * @returns {Promise<any>} Parsed JSON object matching promptCfg.responseSchema
 */
async function runJsonCompletion(promptCfg, userPayload) {
  const {
    model,
    developerMessage,
    responseSchema,
    reasoning,
    verbosity,
    messages,
  } = promptCfg;

  if(!responseSchema || !responseSchema.schema) {
    throw new Error('Prompt config missing responseSchema.schema');
  }

  const request = {
    model,
    messages: buildMessages({ developerMessage, messages }, userPayload),
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: responseSchema.name || 'response',
        strict: responseSchema.strict ?? true,
        schema: responseSchema.schema,
        // OpenAI also supports "description" at the top level; include if present.
        ...(responseSchema.description ? { description: responseSchema.description } : {}),
      },
    },
    // Only include optional fields if provided
    ...(verbosity ? { verbosity } : {}),
    ...(reasoning ? { reasoning_effort: mapReasoning(reasoning) } : {}),
  };

  const resp = await openai.chat.completions.create(request);

  const content = resp?.choices?.[0]?.message?.content;
  if(!content) {
    throw new Error('Empty response from OpenAI');
  }

  // Expecting strict JSON due to response_format. Parse safely.
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch(err) {
    // If model returned extra text, try to extract JSON block as a fallback.
    const match = content.match(/\{[\s\S]*\}$/);
    if(match) {
      parsed = JSON.parse(match[0]);
    } else {
      throw new Error(`Failed to parse JSON response: ${err.message}\nRaw content: ${content}`);
    }
  }

  return parsed;
}

// -------------------- Public API --------------------

/**
 * Name and describe a crafted item.
 * @param {Object} itemDTO - The item metadata used for naming/flavor.
 * @returns {Promise<{name: string, description: string}>}
 */
export const nameCraftedItem = async (itemDTO) => {
  const result = await runJsonCompletion(nameCraftedItemPrompt, { item: itemDTO });
  return result; // { name, description }
};

/**
 * Get ~10 funny, unique random junk items for crafting.
 * @returns {Promise<string[]>}
 */
export const getRandomJunkList = async () => {
  const result = await runJsonCompletion(randomJunkPrompt);
  // Expect shape: { items: string[] }
  return Array.isArray(result?.items) ? result.items : [];
};

/**
 * Generate a single Monty-Python-esque welcome line from the shopkeeper.
 * @returns {Promise<string>}
 */
export const getShopkeeperWelcomeMessage = async () => {
  const result = await runJsonCompletion(shopkeeperWelcomePrompt);
  // Expect shape: { line: string }
  return typeof result?.line === 'string' ? result.line : '';
};