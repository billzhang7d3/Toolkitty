require("dotenv").config();
const { SlashCommandBuilder } = require("discord.js");
const db = require("./../../database/birthdays.js");

module.exports = {
    data: new SlashCommandBuilder() 
        .setName("birthday-user-set")
        .setDescription("set your birthday for server announcements")
        .addIntegerOption(option => 
            option.setName("month")
                .setDescription("birthday month")
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName("day")
                .setDescription("birthday day")
                .setRequired(true)),
    async execute(interaction) {
        if (db.sharedState.setup === "not started") {
            await db.setupDB();
        }
        while (db.sharedState.setup === "setting up") {}
        const month = interaction.options.getInteger("month");
        const day = interaction.options.getInteger("day");
        const guild_id = interaction.guildId;
        const user_id = interaction.user.id;
        if (month < 1 || month > 12) {
            await interaction.reply("Please choose a valid month");
            return;
        }
        try {
            const getQuery = await db.query(`SELECT * FROM birthdays WHERE guild_id = '${guild_id}' AND user_id = '${user_id}';`);
            if (getQuery.rows.length > 0) {
                await db.query(`UPDATE birthdays SET month = ${month}, day = ${day} WHERE guild_id = '${guild_id}' AND user_id = '${user_id}';`);
            } else {
                await db.query(`INSERT INTO birthdays (month, day, guild_id, user_id) VALUES (${month}, ${day}, '${guild_id}', '${user_id}');`);
            }
            await interaction.reply(`Set your birthday (${db.months[month - 1]} ${day}) for server annoucements`);
        } catch (error) {
            console.log(`Error: ${error}`);
            await interaction.reply("There was an error with the request");
        }
    }
}