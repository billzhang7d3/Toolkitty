require("dotenv").config();
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("./../../database/plans.js");

function isCorrectUser(username) {
    return username === process.env.USERNAME1 || username === process.env.USERNAME2;
}

function buildResponse(queryItems) {
    let itemsEmbed = "";
    const emoteUrl = "https://cdn.donmai.us/original/e8/f5/__minato_aqua_and_minato_aqua_hololive_drawn_by_aka_shiba__e8f54af06a53c1fb675397b06823b134.png";
    queryItems.forEach(element => {
        itemsEmbed += ` * (${element.id}) ${element.item}\n`;
    });
    const embed = new EmbedBuilder()
        .setColor(0xFD9AB6)
        .setTitle("Plans")
        .setDescription(itemsEmbed)
        .setFooter({ text: ":3", iconURL: emoteUrl });
    return embed;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("plans-get")
        .setDescription("Get the current list of plans")
        .addBooleanOption(option =>
            option.setName("all")
                .setDescription("Defaults to plans within past 24 hours")
                .setRequired(false)),
    async execute(interaction) {
        if (isCorrectUser(interaction.user.username)) {
            try {
                const getAllPlans = interaction.options.getBoolean("all") ?? false;
                if (getAllPlans) {
                    const query = await db.query("SELECT * FROM plans_table;");
                    // console.log(`Query type: ${query.rows}`);
                    await interaction.reply({ embeds: [buildResponse(query.rows)] });
                } else {
                    const query = await db.query("SELECT * FROM plans_table WHERE created_at >= NOW() - INTERVAL '24 HOURS';");
                    // console.log(`Query type: ${query.rows}`);
                    await interaction.reply({ embeds: [buildResponse(query.rows)] });
                }
            } catch (error) {
                console.log(`Error: ${error}`);
                await interaction.reply("There was an error with the request");
            }
        } else {
            await interaction.reply("You are not authorized to make plans through this bot >.<");
        }
    }
}

