require("dotenv").config();
const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const db = require("./../../database/birthdays.js");


module.exports = {
    data: new SlashCommandBuilder()
        .setName("birthday-server-activate")
        .setDescription("turns on the birthday announcements (requires administrative priveledges)")
        .addChannelOption(option => 
            option.setName("channel")
                .setDescription("choose a channel for birthdays to be announced")
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        if (db.setupState === "not started") {
            await db.setupDB();
        }
        while (db.setupState === "setting up") {}
        console.log("CHECKPOINT");
        const guild_id = interaction.guildId;
        const channel_id = interaction.options.getChannel("channel");
        console.log(guild_id);
        console.log(`|${channel_id}|`);
        try {
            const getQuery = await db.query(`SELECT * FROM guilds WHERE guild_id = '${guild_id}'`);
            if (getQuery.rows.length > 0) {
                await db.query(`UPDATE guilds SET channel_id = '${channel_id}' WHERE guild_id = '${guild_id}';`);
            } else {
                await db.query(`INSERT INTO guilds (guild_id, channel_id) VALUES ('${guild_id}', '${channel_id}')`);
            }
            await interaction.reply(`Now announcing birthdays at ${channel_id}`);
        } catch (error) {
            console.log(`Error: ${error}`);
            await interaction.reply("There was an error with the request");
        }
        /*const getQuery = await db.query("SELECT * FROM guilds WHERE guild_id = '${guild_id}'");
        */
    }
}