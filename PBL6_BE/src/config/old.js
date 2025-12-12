const mysql = require("mysql2");

//test connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST || "loc alhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "test_db",
});

module.exports = connection;
