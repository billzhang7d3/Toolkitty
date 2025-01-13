require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: 5432,
    database: "postgres",
});

const dbName = process.env.PLAN_DB_DATABASE;
const sharedState = {
    setup: "not started",
};

async function createDB() {
    try {
        await pool.connect();
        const result = await pool.query(`SELECT 1 FROM pg_database WHERE datname = '${dbName}';`);
        if (result.rows.length === 0) {  // db does not exist, let's create it
            await pool.query(`CREATE DATABASE ${dbName};`);
            console.log("plans-list: database created");
        } else {
            console.log("plans-list: database already exists");
        }
        pool.database = dbName;
    } catch (err) {
        console.error(`Error checking or creating the database: ${err}`);
    }
}

async function createPlansTable() {
    const tableName = "plans_table";
    let query = `CREATE TABLE IF NOT EXISTS ${tableName} (`;
    query += "id SERIAL PRIMARY KEY,";
    query += "item VARCHAR(200),";
    query += "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);";
    
    try {
        await pool.query(query);
        console.log("plans-list: guild table should be ready");
    } catch (err) {
        console.error("Error checking or creating the database:", err);
    }
}

async function setupDB() {
    sharedState.setup = "setting up";
    await createDB();
    await createPlansTable();
    console.log("plans-list: FINISHED SETTING UP THE DB");
    sharedState.setup = "done";
}

module.exports = {
    query: (text, params) => pool.query(text, params),
    setupDB,
    sharedState,
};