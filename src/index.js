require("dotenv").config();
const {Client, Intents, IntentsBitField, MessageAttachment, AttachmentBuilder, EmbedBuilder} = require("discord.js");
const {OpenAI} = require("openai"); 

const {colemakify, qwertify, repellent} = require("./smallCommands.js");
const {pinExtract, pinShow} = require("./pinCommands.js");

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
})

const prefix = "t<", catgirl = process.env.ARTWORK;

//ready message
client.on("ready", (instance) => {
    console.log(`${instance.user.username}`);
    console.log(`${instance.user.tag}`);
    console.log("~Toolkitty is online UwU~");
});

//catgirl command
client.on("messageCreate", (msg) => {
    if (!msg.content.toLowerCase().startsWith(prefix) || msg.author.bot) { return; }
    msgList = msg.content.substring(prefix.length).split(" ");
    if (msgList.length >= 1) {
        if (msgList[0] === "catgirl") {
            msg.channel.send(catgirl)
        }
    }
});

//small commands
client.on("messageCreate", (msg) => {
    if (!msg.content.toLowerCase().startsWith(prefix) || msg.author.bot) { return; }
    msgList = msg.content.substring(prefix.length).split(" ");
    //repellent
    if (msgList.length >= 1) {
        if (msgList[0] === "repellent" && msg.member.permissions.has("Administrator")) {
            if (!isNaN(parseInt(msgList[1]))) {
                repellent(msg.channel, parseInt(msgList[1]));
            } else {
                repellent(msg.channel, 4);
            }
        }
    }
    //colemakify and qwertify
    if (msgList.length >= 2) {
        if (msgList[0] === "colemakify" || msgList[0] === "c;ukmanleo") {
            msg.channel.send(colemakify(msg.content.substring(10 + prefix.length)));
        } else if (msgList[0] === "qwertify" || msgList[0] === "qwfpgify") {
            msg.channel.send(qwertify(msg.content.substring(8 + prefix.length)));
        }
    }
});

//pin commands
client.on("messageCreate", async (msg) => {
    if (!msg.content.toLowerCase().startsWith(prefix) || msg.author.bot) { return; }
    msgList = msg.content.substring(prefix.length).split(" ");
    if (msgList.length == 1 && msgList[0] === "pins") {
        let pinList = await pinExtract(msg.channel, 1, 100);
        if (pinList[0] !== "") {
            for (let i = 0; i < pinList.length; ++i) {
                msg.channel.send(pinList[i]);
            }
        } else {
            msg.channel.send("Nothing was pinned in this channel~");
        }
    } else if (msgList.length == 2 && msgList[0] === "pins" && !isNaN(parseInt(msgList[1]))) {
        let pinList = await pinExtract(msg.channel, parseInt(msgList[1]), parseInt(msgList[1]));
        if (pinList[0] !== "") {
            for (let i = 0; i < pinList.length; ++i) {
                msg.channel.send(pinList[i]);
            }
        } else {
            msg.channel.send(`There are less than ${parseInt(msgList[1])} pins in this channel~`);
        }
    } else if (msgList.length == 3 && msgList[0] === "pins" && !isNaN(parseInt(msgList[1])) && !isNaN(parseInt(msgList[2]))) {
        let pinList = await pinExtract(msg.channel, parseInt(msgList[1]), parseInt(msgList[2]));
        if (pinList[0] !== "") {
            for (let i = 0; i < pinList.length; ++i) {
                msg.channel.send(pinList[i]);
            }
        } else {
            msg.channel.send(`There are no pins within the ${parseInt(msgList[1])} and ${parseInt(msgList[2])} interval in this channel~`);
        }
    } else if (msgList.length == 2 && msgList[0] === "pinshow" && !isNaN(msgList[1])) {
        let content = await pinShow(msg.channel, parseInt(msgList[1]));
        if (content !== "nope") {
            msg.channel.send(content);
        }
    }
});

//help message
client.on("messageCreate", (msg) => {
    if (!msg.content.toLowerCase().startsWith(prefix) || msg.author.bot) { return; }
    msgList = msg.content.substring(prefix.length).split(" ");
    if (msgList.length == 1) {
        if (msgList[0] === "help") {
            msg.channel.send("help message coming soon nya~");
        }
    }
});

//work in progress stuff
const wip = [
    "summarization subset", 
    "slash commands", 
    "a proper help message"
];
client.on("messageCreate", (msg) => {
    if (!msg.content.toLowerCase().startsWith(prefix) || msg.author.bot) { return; }
    msgList = msg.content.substring(prefix.length).split(" ");
    if (msgList.length == 1) {
        if (msgList[0] === "wip") {
            msg.channel.send(wip.join("\n"));
        }
    }
})

const openai = new OpenAI({
    apiKey: process.env.API_KEY,
})

//summary message
client.on("messageCreate", async (msg) => {
    if (!msg.content.toLowerCase().startsWith(prefix) || msg.author.bot) { return; }
    msgList = msg.content.substring(prefix.length).split(" ");
    if (msgList.length == 3 && msgList[0] === "summarize" && msgList[1] === "number" && !isNaN(parseInt(msgList[2]))) {
        await msg.channel.sendTyping();
        //summarize from n messages above
        if (parseInt(msgList[2]) + 1 > 100) {
            msg.channel.send(`I am not advanced enough to fetch the ${parseInt(msgList[2])} previous messages in this channel.`);
            return;
        }
        let msgContents = await msg.channel.messages.fetch({ limit: parseInt(msgList[2]) + 1 });
        console.log(msgContents);
        let authors = Array.from(msgContents.values()).map(message => (message.author.username));
        let messages = Array.from(msgContents.values()).map(message => (message.content));
        let timestamps = Array.from(msgContents.values()).map(message => (new Date(message.createdTimestamp * 1000)));
        messages.reverse(); messages.pop();
        authors.reverse(); authors.pop();
        timestamps.reverse(); timestamps.pop();
        console.log(authors); console.log(messages); console.log(timestamps);
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
        msg.channel.send(res.choices[0].message.content);
    } else if (msgList.length >= 2 && msgList[0] === "summarize") {
        await msg.channel.sendTyping();
        //fetch the oldest message
        let msg1 = await msg.channel.messages.fetch({
            limit: 1,
            around: msgList[1]
        }).catch((error) => console.error("Message Link Error [fix this later]\n", error));
        msg1 = Array.from(msg1.values())[0];
        //fetch the newest message, if we specified a second parameter, we have to do a different fetch
        let msg2 = await msg.channel.messages.fetch({
            limit: 2,
            around: msg.id
        }).catch((error) => console.error("Message Link Error [fix this later]\n", error));
        msg2 = Array.from(msg2.values())[1];
        if (msgList.length == 3) {
            msg2 = await msg.channel.messages.fetch({
                limit: 1,
                around: msgList[2]
            }).catch((error) => console.error("Message Link Error [fix this later]\n", error));
            msg2 = Array.from(msg2.values())[0];
            if (msg1.channelId != msg2.channelId) {
                msg.channel.send("The messages aren't have the same channel");
                return;
            }
            if (msg1.createdTimestamp > msg2.createdTimestamp) {
                msg.channel.send("The first message has to come before the second.");
                return;
            }
        }
        //console.log(msg1); console.log(msg2);
        //generate the prompt
        let messages = [], authors = [], timestamps = [];
        let curLink = msgList[1];
        for (;;) {
            let cur = await msg.channel.messages.fetch({
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
            conversation += `${authors[i]} said the following at ${timestamps[i].getMinutes()}: "${messages[i]}"\n` 
        }
        //send prompt to gpt-3.5
        //console.log(conversation);
        const res = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ "role": "user", "content": conversation}],
        }).catch((error) => console.error("OpenAI Error:\n", error));
        //console.log(res); console.log(res.choices[0].message.content);
        //send the result back to discord
        msg.channel.send(res.choices[0].message.content);
    }
})

//gpt-4 command
client.on("messageCreate", async (msg) => {
    if (!msg.content.toLowerCase().startsWith(prefix) || msg.author.bot) { return; }
    msgList = msg.content.substring(prefix.length).split(" ");
    if (msgList.length > 1 && msgList[0] === "gpt4") {
        if (msg.author.username === process.env.username1 || msg.author.username === process.env.username2) {
            await msg.channel.sendTyping();
            const prompt = msgList.slice(1).join(" ");
            const res = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [{ "role": "user", "content": prompt}],
            }).catch((error) => console.error("OpenAI Error:\n", error));
            msg.channel.send(res.choices[0].message.content);
        } else {
            msg.channel.send("That's not me");
        }
    }
})

client.login(process.env.TOKEN);
