const { SlashCommandBuilder, ChatInputCommandInteraction} = require("discord.js");

const qwertyLowercase = "abcgkethlynumj;rqsdfivwxoz";
const qwertyUppercase = "ABCGKETHLYNUMJ:RQSDFIVwXOZ";
function qwertify(str) {
    let response = "";
    for (let i = 0; i < str.length; ++i) {
        if (str[i] == 'o') {
            response += ';';
        } else if (str[i] == 'O') {
            response += ':';
        } else if (str.charCodeAt(i) >= 97 && str.charCodeAt(i) <= 122) {
            response += qwertyLowercase[str.charCodeAt(i) - 97];
        } else if (str.charCodeAt(i) >= 65 && str.charCodeAt(i) < 90) {
            response += qwertyUppercase[str.charCodeAt(i) - 65];
        } else if (str[i] == ':') {
            response += 'P';
        } else if (str[i] == ';') {
            response += 'p';
        } else {
            response += str[i];
        }
    }
    return response;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("qwertify")
        .setDescription("Converts text typed from a colemak keyboard into qwerty.")
        .addStringOption(option =>
            option.setName("text")
                .setDescription("Typed from a colemak keyboard.")
                .setRequired(true)),
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
        await interaction.reply(qwertify(interaction.options.getString("text")));
    }
}