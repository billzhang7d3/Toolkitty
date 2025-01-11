require("dotenv").config();
const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const db = require("./../../database/birthdays.js");


module.exports = {
    data: new SlashCommandBuilder()
        .setName("birthday-server-deactivate")
        .setDescription("turns off the birthday announcements (requires administrative priveledges)")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        if (db.setupState === "not started") {
            await db.setupDB();
        }
        while (db.setupState === "setting up") {}
        const guild_id = interaction.guildId;
        // console.log(guild_id);
        try {
            const getQuery = await db.query(`SELECT FROM guilds WHERE guild_id = '${guild_id}'`);
            if (getQuery.rows.length > 0) {
                await db.query(`DELETE FROM guilds WHERE guild_id = '${guild_id}'`);
                await interaction.reply("Deactivated server from birthday announcements");
            } else {
                await interaction.reply("Birthday announcements not set up for server");
            }
        } catch (error) {
            console.log(`Error: ${error}`);
            await interaction.reply("There was an error with the request");
        }
    }
}