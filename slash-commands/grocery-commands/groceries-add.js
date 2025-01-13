require("dotenv").config();
const { getGroceryList } = require("./groceries-get.js");
const { SlashCommandBuilder } = require("discord.js");
const db = require("./../../database/groceries.js");

function isCorrectUser(username) {
    return username === process.env.USERNAME1 || username === process.env.USERNAME2;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("grocery-list-add")
        .setDescription("Adds an item to grocery list")
        .addStringOption(option =>
            option.setName("item")
                .setDescription("Grocery item to add to the list")
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName("quantity")
                .setDescription("how much items to add to the list?")),
    async execute(interaction) {
        if (isCorrectUser(interaction.user.username)) {
            // check if database exists, create if doesn't exist
            if (db.sharedState.setup === "not started") {
                await db.setupDB();
            }
            while (db.sharedState.setup === "setting up") {}
            // command begins here
            const item = interaction.options.getString("item").replace("'", "''");
            const quantity = Math.max(interaction.options.getInteger("quantity") ?? 1, 0);
            try {
                const findQuery = await db.query(`SELECT * FROM groceries_table WHERE item = '${item}'`);
                if (findQuery.rows.length > 0) {
                    await db.query(`UPDATE groceries_table SET quantity = ${quantity + findQuery.rows[0].quantity} WHERE item = '${item}';`);
                } else if (quantity > 0) {
                    await db.query(`INSERT INTO groceries_table (item, quantity) VALUES ('${item}', ${quantity});`);
                }
                const result = await getGroceryList();
                await interaction.reply({ embeds: [result] });
            } catch (error) {
                console.log(`Error: ${error}`);
                await interaction.reply("There was an error with the request");
            }
        } else {
            await interaction.reply("You are not authorized to make plans through this bot >.<");
        }
    }
}