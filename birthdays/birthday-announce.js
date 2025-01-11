require("dotenv").config();
const db = require("./../database/birthdays.js");

function buildResponse(birthdays) {
    if (birthdays.length == 1) {
        return `Happy Birthday <@${birthdays[0].user_id}>!`;
    } else if (birthdays.length == 2) {
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
    // console.log(db.setupState);
    if (db.setupState === "not started") {
        await db.setupDB();
    }
    // console.log(db.setupState);
    while (db.setupState === "setting up") {}
    // console.log(db.setupState);
    const guildQuery = await db.query("SELECT * FROM guilds;");
    const currentDate = new Date();
    guildQuery.rows.forEach(async guild => {
        // do a query for each user here and wish them happy birthday for the resulting users
        const userQuery = await db.query(
            `SELECT * FROM birthdays WHERE guild_id = '${guild.guild_id}' AND month = ${currentDate.getMonth() + 1} AND day = ${currentDate.getDate()};`);
        if (userQuery.rows.length > 0) {
            const channel_id = guild.channel_id.substring(2, guild.channel_id.length - 1);
            const channel = client.channels.cache.get(channel_id);
            // console.log(`birthday-announce: destination channel is ${channel_id}`);
            let responseString = buildResponse(userQuery.rows);
            await channel.send(responseString);
        }
    });
}

module.exports = {
    checkBirthday,
}