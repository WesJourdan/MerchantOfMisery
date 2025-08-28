export const shopkeeperWelcomePrompt = {
  model: 'gpt-5-nano',
  reasoning: 'min',
  verbosity: 'low',
  developerMessage: `
  Write one funny shopkeeper line spoken directly to a hero who just entered the shop. 
  Style: Monty Python medieval sketch — absurd, witty, and memorable. 
  The shopkeeper is trying to sell something ridiculous while welcoming the customer.
  Max 1 sentence. Always spoken in second person ("Welcome, hero!", "Come in!", etc).
  `,
  responseSchema: {
    name: "shop_welcome",
    strict: true,
    schema: {
      type: "object",
      properties: {
        line: { type: "string", description: "A single shopkeeper welcome line" }
      },
      required: ["line"],
      additionalProperties: false
    }
  },
  messages: [
    { role: "assistant", content: { line: "Ah, a valiant hero! Mind the goat, it bites only the rich." }},
    { role: "assistant", content: { line: "Welcome, traveler! Our swords are sharper than the king’s wit, which isn’t saying much." }},
    { role: "assistant", content: { line: "Come in, come in! All helmets half off, provided you don’t mind the missing tops." }},
    { role: "assistant", content: { line: "Greetings, noble warrior! Buy two shields, get a third to cower behind absolutely free." }},
    { role: "assistant", content: { line: "Step lively! The floor is sticky from the last customer who exploded." }},
    { role: "assistant", content: { line: "Ah, you’ve arrived! Today’s special is a cursed chalice—buy one, doom your family for generations!" }},
    { role: "assistant", content: { line: "Welcome, my lord! We sell only the finest potions… brewed in an actual ditch." }},
    { role: "assistant", content: { line: "Good morrow! Armor guaranteed to repel arrows, insults, and the occasional in-law." }},
    { role: "assistant", content: { line: "Enter, enter! Don’t trip over the pile of knights who didn’t read the return policy." }},
    { role: "assistant", content: { line: "Welcome, brave one! For a mere sack of gold I can sell you the illusion of safety." }},
  ]
};

// module.exports = shopkeeperWelcomePrompt;
// export default shopkeeperWelcomePrompt;