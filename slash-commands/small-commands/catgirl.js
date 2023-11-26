require("dotenv").config();
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("catgirl")
        .setDescription("Replies with the PFP fanart"),
    async execute(interaction) {
        await interaction.reply(process.env.ARTWORK);
    }
}