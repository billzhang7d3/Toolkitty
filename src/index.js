require("dotenv").config();
const {Client, Intents, IntentsBitField, MessageAttachment, AttachmentBuilder, EmbedBuilder} = require("discord.js");

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

client.login(process.env.TOKEN);
