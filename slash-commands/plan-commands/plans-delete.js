require("dotenv").config();
const { SlashCommandBuilder } = require("discord.js");
const db = require("./../../database/plans.js");

function isCorrectUser(username) {
    return username === process.env.USERNAME1 || username === process.env.USERNAME2;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("plans-delete")
        .setDescription("Deletes a plan from the current list")
        .addIntegerOption(option => 
            option.setName("id")
                .setDescription("ID of the plan to delete")
                .setRequired(true)),
    async execute(interaction) {
        if (isCorrectUser(interaction.user.username)) {
            const id = interaction.options.getInteger("id");
            try {
                const findQuery = await db.query(`SELECT * FROM plans_table WHERE id = ${id};`);
                if (findQuery.rows.length > 0) {
                    // we have an entry we can delete
                    const deleteQuery = await db.query(`DELETE FROM plans_table WHERE id = ${id};`);
                    await interaction.reply(`__Deleted item with id #**${id}**:__\n\`${findQuery.rows[0].item}\``);
                } else {
                    // we can't delete
                    await interaction.reply(`Item with id ${id} is not on the list`);
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