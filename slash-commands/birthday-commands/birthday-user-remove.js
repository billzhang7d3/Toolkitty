require("dotenv").config();
const { SlashCommandBuilder } = require("discord.js");
const db = require("./../../database/birthdays.js");

module.exports = {
    data: new SlashCommandBuilder() 
        .setName("birthday-user-remove")
        .setDescription("remove your birthday from future server announcements"),
    async execute(interaction) {
        if (db.setupState === "not started") {
            await db.setupDB();
        }
        while (db.setupState === "setting up") {}
        const guild_id = interaction.guildId;
        const user_id = interaction.user.id;
        try {
            const getQuery = await db.query(`SELECT * FROM birthdays WHERE guild_id = '${guild_id}' AND user_id = '${user_id}';`);
            if (getQuery.rows.length > 0) {
                await db.query(`DELETE FROM birthdays WHERE guild_id = '${guild_id}' AND user_id = '${user_id}';`);
                await interaction.reply("Birthday sucessfully removed for future server announcements");
            } else {
                await interaction.reply("Your birthday is not present for future server announcements anyways");
            }
        } catch (error) {
            console.log(`Error: ${error}`);
            await interaction.reply("There was an error with the request");
        }
    }
}