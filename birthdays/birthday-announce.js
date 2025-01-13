require("dotenv").config();
const db = require("./../database/birthdays.js");

async function filterBirthdays(guild, birthdays) {
    const memberList = await guild.members.fetch();
    let memberSet = new Set();
    // memberList.forEach(member => console.log(`member check: |${member.id}|, |${member.user}|`));
    memberList.forEach(member => memberSet.add(member.id));
    let result = [];
    birthdays.forEach(birthday => {
        if (memberSet.has(birthday.user_id)) {
            result.push(birthday);
        }
    });
    return result;
}

function buildResponse(birthdays) {
    if (birthdays.length === 1) {
        return `Happy Birthday <@${birthdays[0].user_id}>!`;
    } else if (birthdays.length === 2) {
        return `Happy Birthday <@${birthdays[0].user_id}> and <@${birthdays[1].user_id}>!`;
    } else {
        let responseString = "Happy Birthday ";
        for (let i = 0; i < birthdays.length - 1; ++i) {
            responseString += `<@${birthdays[i].user_id}>, `;
        }
        return responseString + `and <@${birthdays[birthdays.length - 1].user_id}>!`;
    }
}

async function checkBirthday(client) {
    console.log("ANNOUNCING BIRTHDAY");
    // console.log(`birthday-announce: mutex: ${db.sharedState.setup}`);
    if (db.sharedState.setup === "not started") {
        await db.setupDB();
    }
    // console.log(`birthday-announce: mutex: ${db.sharedState.setup}`);
    while (db.sharedState.setup === "setting up") {}
    // console.log(`birthday-announce: mutex: ${db.sharedState.setup}`);
    const guildQuery = await db.query("SELECT * FROM guilds;");
    const currentDate = new Date();
    console.log(`starting guild fetch for ${guildQuery.rows.length} guilds`);
    guildQuery.rows.forEach(async guild => {
        // do a query for each user here and wish them happy birthday for the resulting users
        const userQuery = await db.query(
            `SELECT * FROM birthdays WHERE guild_id = '${guild.guild_id}' AND month = ${currentDate.getMonth() + 1} AND day = ${currentDate.getDate()};`);
        console.log(`birthday-announce: ${userQuery.rows.length} birthdays to announce today at ${guild.guild_id}`);
        if (userQuery.rows.length > 0) {
            const channel_id = guild.channel_id.substring(2, guild.channel_id.length - 1);
            const channel = client.channels.cache.get(channel_id);
            // console.log(`birthday-announce: destination channel is ${channel_id}`);
            const currentGuild = await client.guilds.cache.get(guild.guild_id);
            // console.log(JSON.stringify(currentGuild.members.cache));
            const birthdays = await filterBirthdays(currentGuild, userQuery.rows);
            const responseString = buildResponse(birthdays);
            await channel.send(responseString);
        }
    });
}

module.exports = {
    checkBirthday,
}