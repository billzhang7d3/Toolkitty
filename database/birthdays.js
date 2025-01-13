require("dotenv").config();
const { Client, Pool } = require("pg");

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: 5432,
    database: "postgres",
});

const dbName = "birthday_db";

const sharedState = {
    setup: "not started",
};
let ready = false;

async function createDB() {
    try {
        await pool.connect();
        const result = await pool.query(`SELECT 1 FROM pg_database WHERE datname = '${dbName}';`);
        if (result.rows.length === 0) {  // db does not exist, let's create it
            await pool.query(`CREATE DATABASE ${dbName};`);
            console.log("birthday-announce: database created");
        } else {
            console.log("birthday-announce: database already exists");
        }
        pool.database = dbName;
    } catch (err) {
        console.error(`Error checking or creating the database: ${err}`);
    }
}

async function createGuildTable() {
    const tableName = "guilds";
    let query = `CREATE TABLE IF NOT EXISTS ${tableName} (`;
    query += "id SERIAL PRIMARY KEY,";
    query += "guild_id VARCHAR(30),";
    query += "channel_id VARCHAR(30),";
    query += "UNIQUE(guild_id));";
    
    try {
        await pool.query(query);
        console.log("birthday-announce: guild table should be ready");
    } catch (err) {
        console.error('Error checking or creating the database:', err);
    }
}

async function createBirthdayTable() {
    const tableName = "birthdays";
    let query = `CREATE TABLE IF NOT EXISTS ${tableName} (`;
    query += "id SERIAL PRIMARY KEY,";
    query += "guild_id VARCHAR(30),";
    query += "month INTEGER,";
    query += "day INTEGER,";
    query += "user_id VARCHAR(30));";

    try {
        await pool.query(query);
        console.log("birthday-announce: birthday table should be ready");
    } catch (err) {
        console.error('Error checking or creating the database:', err);
    }
}

async function setupDB() {
    sharedState.setup = "setting up";
    await createDB();
    await createGuildTable();
    await createBirthdayTable();
    console.log("birthday-announce: FINISHED SETTING UP THE DB");
    sharedState.setup = "done";
}

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

module.exports = {
    query: (text, params) => pool.query(text, params),
    setupDB,
    sharedState,
    months,
};