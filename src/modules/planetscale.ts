require('dotenv').config();
import mysql from "mysql2";

export default async function main() {
  const database_url: string = process.env.DATABASE_URL!;
  const connection = mysql.createConnection(database_url);
  console.log('Connected to PlanetScale!')
  connection.end()
}

main()
  .then(() => process.exit(0));

