import * as dotenv from "dotenv";
dotenv.config()

import * as mysql from "mysql2/promise";

async function main() {
  const database_url: string = `mysql://`
    + `${process.env.USERNAME}:${process.env.PASSWORD}`
    + `@us-west.connect.psdb.cloud/${process.env.DATABASE}`
    + `?ssl={"rejectUnauthorized":true}`;

  console.log("Connecting to PlanetScale...");
  try {
    const connection: mysql.Connection = await mysql.createConnection(
      database_url
    );
    console.log("Successfully connected!");

    // console.log("Creating table...");
    // const query: string = `CREATE TABLE users(`
    //   + `username VARCHAR(255),`
    //   + `bio VARCHAR(255),`
    //   + `email VARCHAR(255),`
    //   + `twitter VARCHAR(255)`
    //   + `);`;
    
    console.log("Reading table...");
    const query: string = "SELECT * FROM users;";
    
    // console.log("Appending to table...");
    // const query: string = `INSERT INTO users `
    //   + `VALUES ("0xfrian", "builder @thecoreloop",`
    //   + `"0xfrian@gmail.com", "@0xfrian");`;
    
    // console.log("Updating row...");
    // const query: string = `UPDATE users `
    //   + `SET bio="dev @thecoreloop" WHERE username="0xfrian"`;
    
    const response: any = await connection.query(query);
    console.log("Response: ", response[0]);
  } catch (error) {
    console.log("Unable to connect!\n");
    throw error;
  }
}

main()
  .then(() => process.exit(0));


