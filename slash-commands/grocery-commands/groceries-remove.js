require("dotenv").config();
const { getGroceryList } = require("./groceries-get.js");
const { SlashCommandBuilder } = require("discord.js");
const db = require("./../../database/groceries.js");

function isCorrectUser(username) {
    return username === process.env.USERNAME1 || username === process.env.USERNAME2;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("grocery-list-remove")
        .setDescription("Removes an item to grocery list")
        .addIntegerOption(option =>
            option.setName("id")
            .setDescription("ID of the item to remove")
            .setRequired(true))
        .addIntegerOption(option =>
            option.setName("quantity")
            .setDescription("How much of that item to remove")),
    async execute(interaction) {
        if (isCorrectUser(interaction.user.username)) {
            const id = interaction.options.getInteger("id");
            const quantity = Math.max(interaction.options.getInteger("quantity") ?? 1, 0);
            try {
                const findQuery = await db.query(`SELECT * FROM groceries_table WHERE id = ${id};`);
                if (findQuery.rows.length > 0) {  // item exists in the db
                    if (findQuery.rows[0].quantity - quantity > 0) {
                        await db.query(`UPDATE groceries_table SET quantity = ${findQuery.rows[0].quantity - quantity} WHERE id = '${id}';`);
                    } else {
                        await db.query(`DELETE FROM groceries_table WHERE id = ${id};`);
                    }
                }
                const result = await getGroceryList();
                await interaction.reply({ embeds: [ result ] });
            } catch (error) {
                console.log(`Error: ${error}`);
                await interaction.reply("There was an error with the request");
            }
        } else {
            await interaction.reply("You are not authorized to make plans through this bot >.<");
        }
    }
}