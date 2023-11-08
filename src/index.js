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
    if (msgList.length == 2 && msgList[0] == "summarize" && !isNaN(parseInt(msgList[1]))) {
        //summarize from n messages above
        if (parseInt(msgList[1]) + 1 > 100) {
            msg.channel.send(`I am not advanced enough to fetch the ${parseInt(msgList[1])} previous messages in this channel.`);
            return;
        }
        let msgContents = await msg.channel.messages.fetch({ limit: parseInt(msgList[1]) + 1 });
        //console.log(msgContents);
        let authors = Array.from(msgContents.values()).map(message => (message.author.username));
        let messages = Array.from(msgContents.values()).map(message => (message.content));
        messages.reverse();
        let msgStr = messages.join(" ");
        console.log(authors);
        console.log(msgStr);
        console.log(messages);
        const res = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ "role": "user", "content": msgStr}],
        }).catch((error) => console.error("OpenAI Error:\n", error));
        console.log(res);
        console.log(res.choices[0].message.content);
        msg.channel.send(res.choices[0].message.content);
    } else if (msgList.length == 2 && msgList[0] == "summarize") {
        //summarize from linked message to now

    } else if (msgList.length == 3 && msgList[0] == "summarize") {
        //summarize from first linked message to second linked message
        msg.channel.send("feature coming soon");
    }
})

client.login(process.env.TOKEN);
