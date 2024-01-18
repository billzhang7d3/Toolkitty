require("dotenv").config();
const { SlashCommandBuilder } = require("discord.js");
const { OpenAI } = require("openai");
const openai = new OpenAI({
    apiKey: process.env.API_KEY,
})

async function gpt4(prompt) {
    const res = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ "role": "user", "content": prompt}],
    }).catch((error) => console.error("OpenAI Error:\n", error));
    if (res.choices[0].message.content.length == 0) { return "empty message??"; }
    return res.choices[0].message.content;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("gpt4")
        .setDescription("Responds to the prompt with the GPT-4 LLM.")
        .addStringOption(option =>
            option.setName("prompt")
            .setDescription("Don't use this command if you didn't create the bot.")
            .setRequired(true))
        .addBooleanOption(option => 
            option.setName("limit")
            .setDescription("Limits the character count to 2000.")
            .setRequired(true)),
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
        if (interaction.user.username === process.env.USERNAME1 || interaction.user.username === process.env.USERNAME2) {
            let prompt = interaction.options.getString("prompt");
            if (interaction.options.getBoolean("limit")) {
                prompt += ". Give a response in 2000 characters or less.";
            }
            console.log("the prompt is: " + prompt);
            await interaction.deferReply();
            const res = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [{ "role": "user", "content": prompt}],
            }).catch((error) => console.error("OpenAI Error:\n", error));
            if (res.choices[0].message.content.length == 0) { return "empty message??";}
            console.log(res.choices[0].message.content);
            await interaction.editReply(res.choices[0].message.content);
        } else {
            await interaction.reply("Sorry, you're not the developer. You don't get to use this command~");
        }
    }
}