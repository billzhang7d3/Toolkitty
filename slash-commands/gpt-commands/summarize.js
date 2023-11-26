require("dotenv").config();
const { SlashCommandBuilder } = require("discord.js");
const { OpenAI } = require("openai");
const openai = new OpenAI({
    apiKey: process.env.API_KEY,
})

async function summarize(channel, msgID1, msgID2, cutoff) {
    await channel.sendTyping();
    //fetch the oldest message
    let msg1 = "nothing", msg2 = "nothing";
    try {
        msg1 = await channel.messages.fetch({ limit: 1, around: msgID1 });
    } catch (error) {
        return "insert error message";
    }
    msg1 = Array.from(msg1.values())[0];
    //fetch the newest message, if we specified a second parameter, we have to do a different fetch
    try {
        msg2 = await channel.messages.fetch({ limit: 2, around: msgID2 });
    } catch (error) {
        return "insert error message";
    }
    msg2 = Array.from(msg2.values())[cutoff];
    if (msg1.channelId != msg2.channelId) { return "The messages aren't have the same channel"; }
    if (msg1.createdTimestamp > msg2.createdTimestamp) { return "The first message has to come before the second."; }
    //console.log(msg1); console.log(msg2);
    //generate the prompt
    let messages = [], authors = [], timestamps = [];
    let curLink = msgID1;
    for (;;) {
        let cur = await channel.messages.fetch({
            limit: 3, 
            around: curLink
        }).catch((error) => console.error("Message Link Error, [fix this later]\n", error));
        cur = Array.from(cur.values());
        //console.log("========================================="); console.log(cur[1].content); console.log(cur[1].author.username); console.log(cur[1].createdTimestamp);
        messages.push(cur[1].content);
        authors.push(cur[1].author.username);
        timestamps.push(new Date(cur[1].createdTimestamp * 1000));
        if (curLink == msg2.id) { break; }
        curLink = cur[0].id;
    }
    //console.log(authors); console.log(messages); console.log(timestamps);
    let conversation = "Summarize the following conversation without any mention of the timestamps: \n";
    for (let i = 0; i < messages.length; ++i) {
        conversation += `${authors[i]} said the following at ${timestamps[i].getMinutes()}: "${messages[i]}"\n`;
    }
    //send prompt to gpt-3.5
    console.log(conversation);
    const res = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ "role": "user", "content": conversation}],
    }).catch((error) => console.error("OpenAI Error:\n", error));
    //console.log(res); console.log(res.choices[0].message.content);
    //send the result back to discord
    return res.choices[0].message.content;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("summarize")
        .setDescription("Summarizes a subset of messages in a specified channel.")
        .addStringOption(option =>
            option.setName("oldest")
            .setDescription("The message to start the summary from.")
            .setRequired(true))
        .addStringOption(option =>
            option.setName("newest")
            .setDescription("The message to end the summary on (defaults to the most recent message)."))
        .addChannelOption(option =>
            option.setName("channel")
            .setDescription("Specify a channel (defaults to the current channel).")),
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
        await interaction.deferReply();
        console.log(interaction.id);
        let channel = interaction.options.getChannel("channel") ?? interaction.channel;
        let oldest = interaction.options.getString("oldest");
        let newest = interaction.options.getString("newest") ?? interaction.id;
        let offset = newest === interaction.id ? 0 : 1;
        console.log("created the parameters");
        const res = await summarize(channel, oldest, newest, offset);
        console.log("checkpoint summarized the given prompt");
        await interaction.editReply(res);
    }
}