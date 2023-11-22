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

async function pinShow(channel, index) {
    if (index < 1) { return "nope"; }
    let pinList = await channel.messages.fetchPinned();
    pinList = Array.from(pinList.values());
    if (index > pinList.length) { return "nope"; }
    let attach = pinList[index - 1].attachments;
    attach = Array.from(attach);
    /*console.log (pinList[index - 1]);
    console.log ("start of command");
    console.log(attach[0]);
    console.log(attach[0] ? attach[0][1] : "nothing to see here");
    console.log(attach[0] ? attach[0][1].attachment : "nothing to see here");*/
    let ans = "";
    for (let i = 0; i < pinList[index - 1].content.length; ++i) {
        if (pinList[index - 1].content[i] === '@') {
            ans += "\`@\`";
        } else {
            ans += pinList[index - 1].content[i];
        }
    }
    ans += " " + (attach[0] ? attach[0][1].attachment : "");
    if (ans !== " ") {
        console.log(pinList[index - 1].content);
        return ans;
    } else {
        return "I am not advanced enough to fetch that kind of message :crying_cat_face:";
    }
}

module.exports = {pinExtract, pinShow};
