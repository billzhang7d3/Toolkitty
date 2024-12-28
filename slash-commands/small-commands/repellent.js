require("dotenv").config();
const { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits} = require("discord.js");

const flashingColors = "https://cdn.discordapp.com/attachments/924506045970255912/1156745442239987794/image0.gif?ex=651616a4&is=6514c524&hm=08694278d6d3d0c77d4e1927e84a1fc139faa219f7e321e4fc476e637a4e2aa9&";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("repellent")
        .setDescription("Sends a bunch of flashing color gifs.")
        .addIntegerOption(option =>
            option.setName("amount")
                .setDescription("Maxes out at 16 gifs."))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), 
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
        let amount = Math.min(interaction.options.getInteger("amount") ?? 4, 16);
        if (amount > 0) { await interaction.reply(flashingColors); }
        for (let i = 1; i < amount; ++i) {
            await interaction.followUp(flashingColors);
        }
    }
}