require("dotenv").config();
const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const questionItems = require("./../../backend/questions.js");

let number = parseInt(fs.readFileSync("./backend/questionNumber.txt"));

module.exports = {
    data: new SlashCommandBuilder()
        .setName("qotd")
        .setDescription("Replies with new question"),
    async execute(interaction) {
        if (interaction.user.username === process.env.USERNAME1 || interaction.user.username === process.env.USERNAME2) {
            const questionList = questionItems.questions;
            /*console.log(`Contents of number: ${number}`);
            console.log(`Type of number: ${typeof number}`);
            console.log(questionList[number]);*/
            try {
                await interaction.reply(questionList[number++]);
                fs.writeFileSync("./backend/questionNumber.txt", number.toString());
            } catch (error) {
                await interaction.reply("you ran out of questions :crying_cat:");
            }
        } else {
            await interaction.reply("Sorry, you're not authorized to use this command :c");
        }
    }
}