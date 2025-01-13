require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: 5432,
    database: "postgres",
});

const dbName = process.env.GROCERY_DB_DATABASE;
const sharedState = {
    setup: "not started",
};

async function createDB() {
    try {
        await pool.connect();
        const result = await pool.query(`SELECT 1 FROM pg_database WHERE datname = '${dbName}';`);
        if (result.rows.length === 0) {  // db does not exist, let's create it
            await pool.query(`CREATE DATABASE ${dbName};`);
            console.log("grocery-list: database created");
        } else {
            console.log("grocery-list: database already exists");
        }
        pool.database = dbName;
    } catch (err) {
        console.error(`Error checking or creating the database: ${err}`);
    }
}

async function createGroceriesTable() {
    const tableName = "groceries_table";
    let query = `CREATE TABLE IF NOT EXISTS ${tableName} (`;
    query += "id SERIAL PRIMARY KEY,";
    query += "item VARCHAR(100),";
    query += "priority INTEGER,";
    query += "quantity INTEGER);";
    
    try {
        await pool.query(query);
        console.log("grocery-list: guild table should be ready");
    } catch (err) {
        console.error("Error checking or creating the database:", err);
    }
}

async function setupDB() {
    sharedState.setup = "setting up";
    await createDB();
    await createGroceriesTable();
    console.log("grocery-list: FINISHED SETTING UP THE DB");
    sharedState.setup = "done";
}

module.exports = {
    query: (text, params) => pool.query(text, params),
    setupDB,
    sharedState,
};