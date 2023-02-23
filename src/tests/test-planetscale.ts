import * as dotenv from "dotenv";
dotenv.config()

// import * as mysql from "mysql2/promise";
import mysql from "mysql2/promise";

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
    // const query: string = `CREATE TABLE tblDailyLAG(`
    //   + `number VARCHAR(255),`
    //   + `date DATE,`
    //   + `category VARCHAR(255),`
    //   + `caption VARCHAR(255),`
    //   + `url VARCHAR(255)`
    //   + `);`;
    
    // console.log("Appending to table...");
    // const query: string = `INSERT INTO tblDailyLAG `
    //   + `VALUES (`
    //   + `4, `
    //   + `"2022-06-29", `
    //   + `"🌊 MARKET ☎️", `
    //   + `"A look at some bullish analysis on the resiliency of games (ya gotta squint a bit but, it's there)", `
    //   + `"https://www.gamesindustry.biz/articles/2022-06-27-charting-the-video-game-industrys-resilience-in-the-face-of-so-much-uncertainty"`
    //   + `);`;
    
    // console.log("Reading table...");
    // const query: string = "SELECT * FROM tblDailyLAG;";
    
    // console.log("Updating row...");
    // const query: string = `UPDATE users `
    //   + `SET bio="dev @thecoreloop" WHERE username="0xfrian"`;
    
    // console.log("Deleting row...");
    // const query: string = `DELETE FROM tblDailyLAG WHERE url="https://www.gamesindustry.biz/articles/2022-06-27-charting-the-video-game-industrys-resilience-in-the-face-of-so-much-uncertainty";`;
    
    console.log("Deleting all rows from table...");
    const query: string = "DELETE FROM tblDailyLAG;";
    
    // console.log("Deleting table...");
    // const query: string = `DROP TABLE tblDailyLAG;`;

    // console.log("Reading table info...");
    // const query: string = `DESCRIBE tblDailyLAG;`;
    
    const response: any = await connection.query(query);
    console.log("Response: ", response[0]);
  } catch (error) {
    console.log("Unable to connect!\n");
    throw error;
  }
}

main()
  .then(() => process.exit(0));

