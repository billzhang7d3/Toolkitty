require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");
const { Client, Collection, Events, GatewayIntentBits } = require("discord.js");
const { token } = require("./config.json");
const questionItems = require("./backend/questions.js");
const cron = require("cron");

const client = new Client({intents: [
    GatewayIntentBits.Guilds
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

//qotd message scheduling
client.once("ready", () => {
    let sent = fs.readFileSync("./backend/sent.txt") === "true";
    let qotd = cron.CronJob.from({
        cronTime: "0 0 0 * * *",
        onTick: async function() {
            let number = parseInt(fs.readFileSync("./backend/questionNumber.txt"));
            let channel = client.channels.cache.get("1051617097458929706");
            sent = false;
            if (number < questionItems.questions.length) {
                /*let recent = await channel.messages.fetch();
                console.log(recent.createdTimestamp);
                let timestamp = new Date(recent.createdTimestamp * 1000);*/
                channel.send(questionItems.questions[number++]);
                fs.writeFileSync("./backend/questionNumber.txt", number.toString());
                fs.writeFileSync("./backend/sent.txt", "true");
            } else {
                channel.send(`Ran out of questions <@${process.env.USERNAME1}> please fix :c`);
                fs.writeFileSync("./backend/sent.txt", "true");
            }
        },
        start: true,
        timeZone: "America/Los_Angeles"
    });
    let retry = cron.CronJob.from({
        cronTime: "0 5 * * * * ",
        onTick: async function() {
            console.log("will look into sending message");
            /*
            let number = parseInt(fs.readFileSync("./backend/questionNumber.txt"));
            let channel = client.channels.cache.get("1051617097458929706");
            if (number < questionItems.questions.length) {
                let recent = await channel.messages.fetch();
                console.log(recent.createdTimestamp);
                let timestamp = new Date(recent.createdTimestamp * 1000);
                channel.send(questionItems.questions[number++]);
                fs.writeFileSync("./backend/questionNumber.txt", number.toString());
                fs.writeFileSync("./backend/sent.txt", "true");
            } else {
                channel.send(`Ran out of questions <@${process.env.USERNAME1}> please fix :c`);
                fs.writeFileSync("./backend/sent.txt", "true");
            }
            */
        },
        start: true,
        timeZone: "America/Los_Angeles"
    });
})

//dumb message detection feature that I'm just using for reference later on
client.once("ready", () => {
    let test = cron.CronJob.from({
        cronTime: "0 * * * * * ",
        onTick: async function() {
            console.log("sending new message");
            let channel = client.channels.cache.get("1148706636068814969");
            //console.log(channel);
            let recent = await channel.messages.fetch({limit: 1});
            recent = Array.from(recent.values()).map(entry => entry.createdTimestamp);
            let timestamp = new Date(parseInt(recent)).toLocaleString("en-US", {
                timeZone: "America/Los_Angeles"
            });
            /*let date = new Date().toLocaleString("en-US", {
                timeZone: "America/Los_Angeles"
            });*/
            let date = new Date();
            console.log(typeof date.getTime());
            let diff = (parseInt(date.getTime()) - parseInt(recent)) / (1000 * 60 * 60);
            console.log(diff);
            if (diff >= 1) {
                console.log("more than one hour time difference");
            } else {
                console.log("message has been sent in the past hour");
            }
        },
        start: true,
        timeZone: "America/Los_Angeles"
    });
})

client.login(token);