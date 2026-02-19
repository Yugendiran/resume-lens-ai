import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const dbConn = mysql.createPool(process.env.DB_URL);

dbConn.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Database Connected Successfully");
  connection.release();
});

export { dbConn };
