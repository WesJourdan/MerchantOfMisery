export const nameCraftedItemPrompt = {
  model: 'gpt-5-nano',
  reasoning: 'min',
  verbosity: 'low',
  developerMessage: `
  Name this parody video game RPG loot using the provided metadata. Capture a Diablo meets Monkey Island vibe. Don't list stats; just use them for inspiration. Be entertaining.

  DO NOT MENTION DIABLO OR MONKEY ISLAND IN YOUR DESCRIPTION
  `,
  responseSchema: {
    "name": "named_rpg_loot",
    "strict": true,
    "description": null,
    "schema": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string",
          "description": "format: {Flavor or Materials or Affixes inspired Adjective} {Slot inspired Medieval Noun} of {Flavor or Materials or Affixes inspired Compound Noun}`"
        },
        "description": {
          "type": "string",
          "description": "A punchy descriptive and entertaining text. Max 2 sentences"
        }
      },
      "required": [
        "name",
        "description"
      ],
      "additionalProperties": false
    }
  }
};
// export default nameCraftedItemPrompt;
// module.exports = nameCraftedItemPrompt;
