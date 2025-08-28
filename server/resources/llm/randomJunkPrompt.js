export const randomJunkPrompt = {
  model: 'gpt-5-nano',
  reasoning: 'min',
  verbosity: 'low',
  developerMessage: `
  You provide an array of strings corresponding to funny and unexpected crafting ingredients. Think Diablo meets Monkey Island. Imaging a list of things laying around a medieval blacksmiths shop. Provide about 10 unique items. Do NOT repeat items.

  Response string format: {noun} OR {adjective noun}
  `,
  responseSchema: {
    "name": "random_crafting_junk_arr",
    "strict": true,
    "schema": {
      "type": "object",
      "properties": {
        "items": {
          "type": "array",
          "description": "An array of string values.",
          "items": {
            "type": "string",
            "description": "A funny random object to be used in crafting"
          }
        }
      },
      "required": [
        "items"
      ],
      "additionalProperties": false
    }
  },
  messages: [
    {
      role: "assistant", content: {
        items: [
          "rusty spoon",
          "boiled crow feather",
          "glow-in-the-dark thumb tack",
          "squeaking mouse wheel",
          "sourdough crust",
          "smoked rat tail",
          "fizzy ale cork",
          "hushed candle",
          "glass eyeball",
          "gaffer’s thimble"
        ]
      }
    },
    { role: "user", content: "Give me an even better set! Dark Medieval Fantasy Spoof meets Monkey Island. More funny than ridiculous." },
  ],
};
// module.exports = randomJunkPrompt;
// export default randomJunkPrompt;

// sampleItems: [
//   "rusty spoon",
//   "boiled crow feather",
//   "tangle of rope",
//   "singed napkin",
//   "dented mug",
//   "squeaking mouse wheel",
//   "fizzy ale cork",
//   "polished dragon scale",
//   "crooked horseshoe",
//   "newt eyeball",
//   "glow-in-the-dark thumb tack",
//   "oil-soaked parchment",
//   "squeaky toy bell",
//   "soured peppermint",
//   "frost-worn coin",
//   "cracked bellows",
//   "vulture feather",
//   "sourdough crust",
//   "smoked rat tail",
//   "hushed candle",
//   "stubby quill",
//   "boiled beetle",
//   "tarnished bolt",
//   "cinder-scented rag",
//   "stale ale dregs",
//   "glass eyeball",
//   "gutter ash",
//   "bee sting jar",
//   "charred wood splinter",
//   "gaffer’s thimble",
//   "dusty tome of questionable morals",
//   "tarred raven feather",
//   "witty goblin beard",
//   "cracked brazier lid",
//   "stolen candle from a rival smith",
//   "gossiping bolt of steel",
//   "sour wine cork",
//   "whistling kettle lid",
//   "glittering moth in a bottle",
//   "pocketful of lost coins",
//   "graveyard daisy",
//   "damp burlap sack",
//   "clinking tooth jar",
//   "mildewed codpiece",
//   "blood-inked ledger page",
//   "burnt scarecrow stuffing",
//   "suspiciously warm rock",
//   "withered rat paw",
//   "unholy bar tab",
//   "barnacle-encrusted horseshoe",
//   "splintered stool leg",
//   "half-melted candle stub",
//   "cracked tankard",
//   "moth-eaten glove",
//   "charred bread crust",
//   "dented chamber pot",
//   "pickle brine jar",
//   "singed prayer ribbon",
//   "cobbler’s bent awl",
//   "drunken bard’s lute string"
// ]