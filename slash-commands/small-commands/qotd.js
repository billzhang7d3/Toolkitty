require("dotenv").config();
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const questionItems = require("./../../backend/questions.js");

let number = parseInt(fs.readFileSync("./backend/questionNumber.txt"));

function buildResponse(question) {
    const embed = new EmbedBuilder()
        .setColor(0xFD9AB6)
        .setTitle("Question of the Day:")
        .setDescription(question)
        .setFooter({text: ":3", iconURL: "https://cdn.donmai.us/original/e8/f5/__minato_aqua_and_minato_aqua_hololive_drawn_by_aka_shiba__e8f54af06a53c1fb675397b06823b134.png"});
    return embed;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("qotd")
        .setDescription("Replies with new question")
        .addBooleanOption(option => 
            option.setName("increment")
            .setDescription("vrej")),
    async execute(interaction) {
        if (interaction.user.username === process.env.USERNAME1 || interaction.user.username === process.env.USERNAME2) {
            if (number < questionItems.questions.length) {
                console.log(typeof questionItems.questions[number]);
                interaction.channel.send({embeds: [buildResponse(questionItems.questions[number++])]});
                let current = new Date();
                console.log(current.getMonth());
                console.log("QOTD: " + String(current.getMonth() + 1) + "/" + String(current.getDate()) + "/" + String(current.getFullYear()));
                const thread = await interaction.channel.threads.create({
                    name: "QOTD: " + String(current.getMonth()) + "/" + String(current.getDate()) + "/" + String(current.getFullYear()),
                    autoArchiveDuration: 60,
                    reason: "Discussion pertaining to the question " + questionItems.questions[number - 1],
                });
                let increment = interaction.options.get("increment") ?? false;
                if (increment) {
                    --number;
                }
                fs.writeFileSync("./backend/questionNumber.txt", number.toString());
                fs.writeFileSync("./backend/sent.txt", "true");
                console.log("wrote something");
            } else {
                channel.send(`Ran out of questions <@${process.env.USERNAME1}> please fix :c`);
                fs.writeFileSync("./backend/sent.txt", "true");
                console.log("didn't write anything");
            }
        } else {
            await interaction.reply("Sorry, you're not authorized to use this command :c");
        }
    }
}