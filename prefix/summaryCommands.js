require("dotenv").config();
const {Client, Intents, IntentsBitField, MessageAttachment, AttachmentBuilder, EmbedBuilder} = require("discord.js");
const {OpenAI} = require("openai"); 

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});
const openai = new OpenAI({
    apiKey: process.env.API_KEY,
})

//subset summary 
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
    //console.log(conversation);
    const res = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ "role": "user", "content": conversation}],
    }).catch((error) => console.error("OpenAI Error:\n", error));
    //console.log(res); console.log(res.choices[0].message.content);
    //send the result back to discord
    return res.choices[0].message.content;
}

async function summarizeN(channel, amount) {
    await channel.sendTyping();
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
    //console.log(conversation);
    const res = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ "role": "user", "content": conversation}],
    }).catch((error) => console.error("OpenAI Error:\n", error));
    //console.log(res); console.log(res.choices[0].message.content);
    return res.choices[0].message.content;
}

//gpt-4 command
async function gpt4(channel, prompt) {
    await channel.sendTyping();
    const res = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ "role": "user", "content": prompt.join()}],
    }).catch((error) => console.error("OpenAI Error:\n", error));
    return res.choices[0].message.content;
}

module.exports = {summarize, summarizeN, gpt4};
