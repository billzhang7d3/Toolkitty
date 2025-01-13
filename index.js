require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");
const { Client, Collection, Events, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const bc = require("./birthdays/birthday-announce.js");
const cron = require("cron");

const client = new Client({intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
]});

let asked = false;

client.commands = new Collection();
const foldersPath = path.join(__dirname, "slash-commands");
const commandFolders = fs.readdirSync(foldersPath);
for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ("data" in command && "execute" in command) {
            client.commands.set(command.data.name, command);
            console.log(`Command ${command.data.name} deployed.`);
            //console.log(command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

const eventsPath = path.join(__dirname, "events");
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith(".js"));
for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

client.once(Events.ClientReady, instance => {
    console.log(`${instance.user.username}`);
    console.log(`${instance.user.tag}`);
    console.log("~Toolkitty is online UwU~");
})

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) { return; }
    console.log(interaction);
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }
    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: "There was an error while executing this command!", ephemeral: true});
        } else {
            await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true});
        }
    }
});

function buildResponse(question) {
    const embed = new EmbedBuilder()
        .setColor(0xFD9AB6)
        .setTitle("Question of the Day:")
        .setDescription(question)
        .setFooter({text: ":3", iconURL: "https://cdn.donmai.us/original/e8/f5/__minato_aqua_and_minato_aqua_hololive_drawn_by_aka_shiba__e8f54af06a53c1fb675397b06823b134.png"});
    return embed;
}

const cronTimeTest      = "5 * * * * * ";
const cronTimeDeploy    = "* 1 0 * * * ";
client.once("ready", () => {
    console.log("ready to announce birthdays");
    let announceBirthday = cron.CronJob.from({
        cronTime: cronTimeDeploy,
        onTick: async () => { bc.checkBirthday(client); },
        start: true,
        timeZone: "America/Los_Angeles",
    });
});

client.login(process.env.TOKEN);