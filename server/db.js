import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "cleaning_platform_db",
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  foundRows: true,
};

// Create the connection pool
const pool = mysql.createPool(dbConfig);

// Optional: Test the connection
pool.getConnection()
  .then(connection => {
    console.log('Successfully connected to the database. ✨');
    connection.release();
  })
  .catch(err => {
    console.error('Error connecting to the database:', err);
    // Depending on the setup, you might want to exit the process
    // process.exit(1);
  });

export default pool;
