require("dotenv").config();
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("./../../database/groceries.js");

function isCorrectUser(username) {
    return username === process.env.USERNAME1 || username === process.env.USERNAME2;
}

function buildResponse(queryItems) {
    // console.log("BUILDING THE RESPONSE");
    const emoteUrl = "https://cdn.donmai.us/original/e8/f5/__minato_aqua_and_minato_aqua_hololive_drawn_by_aka_shiba__e8f54af06a53c1fb675397b06823b134.png";
    let idEmbed = "", itemEmbed = "", quantityEmbed = "";
    queryItems.forEach(element => {
        idEmbed += `${element.id}\n`;
        itemEmbed += `${element.item}\n`;
        quantityEmbed += `${element.quantity}\n`;
    });
    const valueEmbed = (embed) => { return queryItems.length > 0 ? embed : "."; }
    const embed = new EmbedBuilder()
        .setColor(0xFD9AB6)
        .setTitle("Groceries")
        .addFields(
            { name: "ID", value: valueEmbed(idEmbed), inline: true },
            { name: "Item", value: valueEmbed(itemEmbed), inline: true },
            { name: "Quantity", value: valueEmbed(quantityEmbed), inline: true },
        )
        .setFooter({ text: ":3", iconURL: emoteUrl });
    return embed;
}

async function getGroceryList() {
    const query = await db.query("SELECT * FROM groceries_table ORDER BY id");
    return buildResponse(query.rows);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("grocery-list-get")
        .setDescription("Get the current list of groceries"),
    async execute(interaction) {
        if (isCorrectUser(interaction.user.username)) {
            try {
                const result = await getGroceryList();
                await interaction.reply({ embeds: [ result ] });
            } catch (error) {
                console.log(`Error: ${error}`);
                await interaction.reply("There was an error with the request");
            }
        } else {
            await interaction.reply("You are not authorized to make plans through this bot >.<");
        }
    },
    getGroceryList
}