require("dotenv").config();
const { SlashCommandBuilder } = require("discord.js");
const { OpenAI } = require("openai");
const openai = new OpenAI({
    apiKey: process.env.API_KEY,
})

async function summarizeN(channel, amount) {
    if (amount < 1) { return "I can't summarize anything"; }
    if (amount > 100) { return `I am not advanced enough to fetch the ${parseInt(msgList[2])} previous messages in this channel.`; }
    //fetch the amount of messages
    let msgContents = await channel.messages.fetch({ limit: amount + 1 });
    //console.log(msgContents);
    let authors = Array.from(msgContents.values()).map(message => (message.author.username));
    let messages = Array.from(msgContents.values()).map(message => (message.content));
    let timestamps = Array.from(msgContents.values()).map(message => (new Date(message.createdTimestamp * 1000)));
    messages.reverse(); messages.pop();
    authors.reverse(); authors.pop();
    timestamps.reverse(); timestamps.pop();
    //console.log(authors); console.log(messages); console.log(timestamps);
    //create the prompt
    let conversation = "Summarize the following conversation without any mention of the timestamps: \n";
    for (let i = 0; i < messages.length; ++i) {
        conversation += `${authors[i]} said the following at ${timestamps[i].getMinutes()}: "${messages[i]}"\n` 
    }
    console.log(conversation);
    const res = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ "role": "user", "content": conversation}],
    }).catch((error) => console.error("OpenAI Error:\n", error));
    console.log(res); console.log(res.choices[0].message.content);
    return res.choices[0].message.content;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("summarize-last")
        .setDescription("Summarizes the last n messages in a specified channel.")
        .addIntegerOption(option => 
            option.setName("n")
            .setDescription("The amount of messages to summarize.")
            .setRequired(true))
        .addChannelOption(option =>
            option.setName("channel")
            .setDescription("Specify a channel (defaults to the current channel).")),
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
        await interaction.deferReply();
        let channel = interaction.options.getChannel("channel") ?? interaction.channel;
        const res = await summarizeN(channel, interaction.options.getInteger("n"));
        console.log("checkpoint 555555");
        await interaction.editReply(res);
    }    
}