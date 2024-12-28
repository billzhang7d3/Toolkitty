require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
    user: process.env.PLAN_DB_USER,
    password: process.env.PLAN_DB_PASS,
    host: process.env.PLAN_DB_HOST,
    port: 5432,
    database: process.env.PLAN_DB_DATABASE,
});


module.exports = {
    query: (text, params) => pool.query(text, params)
};