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

async function pinExtract(channel, start, end) {
    let pinList = await channel.messages.fetchPinned();
    pinList = Array.from(pinList.values()).map(message => (message.url));
    let outputList = [""], ind = 0;
    //for (let i = start - 1; i <= Math.min(pinList.length - 1, end); ++i) {
    for (let i = Math.min(pinList.length - 1, end - 1); i >= start - 1; --i) {
        if (outputList[ind].length + pinList[i].length + 2 <= 2000) {
            outputList[ind] += pinList[i] + "\n";
        } else {
            outputList.push(pinList[i] + "\n");
            ++ind;
        }
    }
    return outputList;
}


module.exports = {pinExtract};