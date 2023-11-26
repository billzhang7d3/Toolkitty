require("dotenv").config();
const { SlashCommandBuilder } = require("discord.js");

const helpMessage = "## Command List:\nYou don't need to use this lol. Slash commands are awesome.";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("shows command list and how to use each Toolkitty command."),
    async execute(interaction) {
        await interaction.reply(helpMessage);
    }
}