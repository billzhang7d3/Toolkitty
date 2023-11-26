require("dotenv").config();
const { SlashCommandBuilder, ChatInputCommandInteraction} = require("discord.js");

const colemakLowercase = "abcsftdhuneimky;qprglvwxjz";
const colemakUppercase = "ABCSFTDHUNEIMKY:QPRGLVWXJZ";
function colemakify(str) {
    let response = "";
    for (let i = 0; i < str.length; ++i) {
        if (str.charCodeAt(i) >= 97 && str.charCodeAt(i) <= 122) {
            response += colemakLowercase[str.charCodeAt(i) - 97];
        } else if (str.charCodeAt(i) >= 65 && str.charCodeAt(i) < 90) {
            response += colemakUppercase[str.charCodeAt(i) - 65];
        } else if (str[i] == ':') {
            response += 'O';
        } else if (str[i] == ';') {
            response += 'o';
        } else {
            response += str[i];
        }
    }
    return response;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("colemakify")
        .setDescription("Converts text typed from a qwerty keyboard into colemak.")
        .addStringOption(option => 
            option.setName("text")
            .setDescription("Typed from a qwerty keyboard.")
            .setRequired(true)),
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
        await interaction.reply(colemakify(interaction.options.getString("text")));
    }
}