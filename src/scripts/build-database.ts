import dotenv from "dotenv";
dotenv.config()
import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";
import { TelegramClient } from "telegram";
import { parseLAG } from "../modules/lag";
import { parseDate } from "../modules/date";
import { TelegramMessage, LAG } from "../types";
import { createTelegramClient, readMessages  } from "../modules/telegram";

export default async function main(): Promise<void> {
  // Connect to Telegram
  console.log("Connecting to Telegram . . . ");
  const string_session: string = process.env.TELEGRAM_STRING_SESSION!;
  const client_telegram: TelegramClient  = await createTelegramClient(string_session);

  // Read Telegram messages
  console.log("\nReading messages from 'thecoreloop' channel . . . ");
  const dir_LAG_json: string = path.join(__dirname, "../../LAG/json/");
  const messages: TelegramMessage[] = await readMessages(client_telegram, "thecoreloop");
  for (let i = 0; i < messages.length; i++) {
    let message: TelegramMessage = messages[i];

    // Console-log first line of message
    console.log(`  Message #${message.id}: "${message.text.split("\n")[0]}"`);

    try {
      // Parse LAG from Telegram message
      const lag: LAG = parseLAG(message);
      console.log(`    ﬌ LAG #${lag.number} found!`);

      // LAG #124 spans across 2 messages
      if (lag.number == "124") {
        message = {
          id: message.id,
          text: messages[i].text + messages[i+1].text,
        };
      }

      // Write LAG to .json file
      const filepath_json: string = path.join(
        dir_LAG_json,
        `lag-${String(lag.number).padStart(3, "0")}.json`
      );
      console.log(`    ﬌ Writing file: ./${filepath_json.split("/").slice(-3).join("/")}`);
      fs.writeFileSync(filepath_json, JSON.stringify(lag, null, 2));
    } catch (error: unknown) {
      if (error instanceof Error) console.log(`    ﬌ Error: ${error.message}`);
      else throw error;
    }
  }

  // Connect to PlanetScale
  const database_url: string = `mysql://`
    + `${process.env.USERNAME}:${process.env.PASSWORD}`
    + `@us-west.connect.psdb.cloud/${process.env.DATABASE}`
    + `?ssl={"rejectUnauthorized":true}`;

  console.log("\nConnecting to PlanetScale...");
  try {
    const connection: mysql.Connection = await mysql.createConnection(
      database_url
    );

    // Push Telegram messages to PlanetScale
    const filenames_json: string[] = fs.readdirSync(dir_LAG_json);
    console.log("\nPushing LAG posts to PlanetScale: ");
    for (const filename_json of filenames_json) {
      const filepath_json: string = path.join(dir_LAG_json, filename_json);
      const lag: LAG = JSON.parse(fs.readFileSync(
        filepath_json,
        { encoding: "utf-8" }
      ));
      // Parse date from "verbose" to "YYYY-MM-DD" format
      const lag_date: string = parseDate(lag.date, false);

      // Append each article as a row in tblDailyLAG table
      for (const article_group of lag.content) {
        for (const article of article_group.articles) {
          // Note: need to escape double quotes from article caption
          const values: any[] = [
            `"${lag.number}"`,
            `"${lag_date}"`,
            `"${article_group.category}"`,
            `"${article.caption.replaceAll(`"`, `\\"`)}"`,
            `"${article.url}"`
          ];
      
          console.log(
            `  LAG #${lag.number.toString().padStart(3, "0")}`
            + ` | ${article_group.category}` 
            + ` | ${article.url}`
          );
          const query: string = "INSERT INTO tblDailyLAG "
            + `VALUES (${values.join(", ")});`;
      
          await connection.query(query);
        }
      }
    }
  } catch (error) {
    throw error;
  }
}

main()
  .then(() => process.exit(0));

