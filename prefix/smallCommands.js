require("dotenv").config();
const {Client, Intents, IntentsBitField, MessageAttachment, AttachmentBuilder, EmbedBuilder} = require("discord.js");
const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

//colemakify function
const colemakLowercase = "abcsftdhuneimky;qprglvwxjz";
const colemakUppercase = "ABCSFTDHUNEIMKY:QPRGLVWXJZ";
function colemakify(str) {
    let response = "";
    for (let i = 0; i < str.length; ++i) {
        if (str.charCodeAt(i) >= 97 && str.charCodeAt(i) <= 122) {
            response += colemakLowercase[str.charCodeAt(i) - 97];
        } else if (str.charCodeAt(i) >= 65 && str.charCodeAt(i) < 90) {
            response += colemakUppercase[str.charCodeAt(i) - 65];
        } else if (str[i] == ':') {
            response += 'O';
        } else if (str[i] == ';') {
            response += 'o';
        } else {
            response += str[i];
        }
    }
    return response;
}

const qwertyLowercase = "abcgkethlynumj;rqsdfivwxoz";
const qwertyUppercase = "ABCGKETHLYNUMJ:RQSDFIVwXOZ";
function qwertify(str) {
    let response = "";
    for (let i = 0; i < str.length; ++i) {
        if (str[i] == 'o') {
            response += ';';
        } else if (str[i] == 'O') {
            response += ':';
        } else if (str.charCodeAt(i) >= 97 && str.charCodeAt(i) <= 122) {
            response += qwertyLowercase[str.charCodeAt(i) - 97];
        } else if (str.charCodeAt(i) >= 65 && str.charCodeAt(i) < 90) {
            response += qwertyUppercase[str.charCodeAt(i) - 65];
        } else if (str[i] == ':') {
            response += 'P';
        } else if (str[i] == ';') {
            response += 'p';
        } else {
            response += str[i];
        }
    }
    return response;
}

const flashingColors = "https://cdn.discordapp.com/attachments/924506045970255912/1156745442239987794/image0.gif?ex=651616a4&is=6514c524&hm=08694278d6d3d0c77d4e1927e84a1fc139faa219f7e321e4fc476e637a4e2aa9&";
function repellent(channel, quantity) {
    for (let i = 0; i < Math.min(quantity, 16); ++i) {
        channel.send(flashingColors);
    }
}

module.exports = {colemakify, qwertify, repellent};
