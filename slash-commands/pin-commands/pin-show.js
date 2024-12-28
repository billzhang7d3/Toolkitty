require("dotenv").config();
const { SlashCommandBuilder } = require("discord.js");

async function pinShow(channel, index) {
    if (index < 1) { return "nope"; }
    let pinList = await channel.messages.fetchPinned();
    pinList = Array.from(pinList.values());
    if (index > pinList.length) { return `<#${channel.id}> does not have ${index} pins`; }
    let attach = pinList[index - 1].attachments;
    attach = Array.from(attach);
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

module.exports = {
    data: new SlashCommandBuilder()
        .setName("pin-show")
        .setDescription("Shows the pin at a given integer position")
        .addIntegerOption(option => 
            option.setName("position")
                .setDescription("Set the pin position to show")
                .setRequired(true)),
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
        await interaction.reply(
            await pinShow(interaction.channel, interaction.options.getInteger("position") + 1)
        );
    }
}
