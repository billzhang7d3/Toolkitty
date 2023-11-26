require("dotenv").config();
const { SlashCommandBuilder } = require("discord.js");

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

module.exports = {
    data: new SlashCommandBuilder()
        .setName("pins")
        .setDescription("Replies with list of pins")
        .addIntegerOption(option=>
            option.setName("end-position")
            .setDescription("Set the pin to stop at. Required field and must be less than the number of pins in the channel."))
        .addIntegerOption(option => 
            option.setName("start-position")
            .setDescription("Set the starting pin number. If left empty, it starts at the first pin")),
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
        let start = interaction.options.getInteger("start-position") ?? 1;
        if (start < 1) {
            await interaction.reply("Invalid starting position.");
            return;
        }
        let end = interaction.options.getInteger("end-position") ?? 50;
        if (end < start) {
            await interaction.reply("Invalid ending position.");
            return;
        }
        let pinList = await pinExtract(interaction.channel, start, end);
        pinList.reverse();
        if (pinList.length == 0) {
            await interaction.reply("Nothing was pinned in this channel~");
            return;
        }
        await interaction.reply(pinList[0]);
        for (let i = 1; i < pinList.length; ++i) {
            await interaction.followUp(pinList[i]);
        }
    }
}
