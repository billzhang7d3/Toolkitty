require("dotenv").config();
const { SlashCommandBuilder } = require("discord.js");
const db = require("./../../database/plans.js");

function isCorrectUser(username) {
    return username === process.env.USERNAME1 || username === process.env.USERNAME2;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("plans-add")
        .setDescription("Adds a plan to current plans list")
        .addStringOption(option =>
            option.setName("plan")
                .setDescription("What do you want to accomplish?")
                .setRequired(true)),
    async execute(interaction) {
        if (isCorrectUser(interaction.user.username)) {
            let item = interaction.options.getString("plan");
            const item0 = item;
            item = item.replace("'", "''");
            try {
                const query = await db.query(
                    `INSERT INTO plans_table (item) VALUES ('${item}');`
                );
                await interaction.reply(`__Plan successfully added:__\n${item0}`);
            } catch (error) {
                console.log(`Error: ${error}`);
                await interaction.reply("There was an error with the request");
            }
        } else {
            await interaction.reply("You are not authorized to make plans through this bot >.<");
        }
    }
}