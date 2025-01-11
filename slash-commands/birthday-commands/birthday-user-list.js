require("dotenv").config();
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("./../../database/birthdays.js");


function buildResponse(queryItems) {
    const emoteUrl = "https://cdn.donmai.us/original/e8/f5/__minato_aqua_and_minato_aqua_hololive_drawn_by_aka_shiba__e8f54af06a53c1fb675397b06823b134.png";
    let userEmbed = "", monthEmbed = "", dayEmbed = "";
    queryItems.forEach(element => {
        userEmbed += `<@${element.user_id}>\n`;
        monthEmbed += `${db.months[element.month - 1]}\n`;
        dayEmbed += `${element.day}\n`;
    });
    const valueEmbed = (embed) => { return queryItems.length > 0 ? embed : "."; }
    const embed = new EmbedBuilder()
        .setColor(0xFD9AB6)
        .setTitle("Server Birthdays")
        .addFields(
            { name: "User", value: valueEmbed(userEmbed), inline: true },
            { name: "Month", value: valueEmbed(monthEmbed), inline: true },
            { name: "Day", value: valueEmbed(dayEmbed), inline: true },
        )
        .setFooter({ text: ":3", iconURL: emoteUrl });
    return embed;
}

module.exports = {
    data: new SlashCommandBuilder() 
        .setName("birthday-user-list")
        .setDescription("Get a list of birthdays for this server"),
    async execute(interaction) {
        console.log(`starting command with ${db.setupState}`);
        if (db.setupState === "not started") {
            await db.setupDB();
        }
        while (db.setupState === "setting up") {}
        const guild_id = interaction.guildId;
        try {
            const query = await db.query(`SELECT * FROM birthdays WHERE guild_id = '${guild_id}' ORDER BY month ASC, day ASC;`);
            await interaction.reply({ embeds: [buildResponse(query.rows)] });
        } catch (error) {
            console.log(`Error: ${error}`);
            await interaction.reply("There was an error with the request");
        }
    }
}