// Enable environmental variables
require('dotenv').config();

// Node Modules
import fs from "fs";
import path from "path";

// Local modules
import { parseLAG, attachMetadata } from "../modules/lag";
import { createTelegramClient, readMessages  } from "../modules/telegram";

// Types 
import { TelegramClient } from "telegram";
import { TelegramMessage, LAG } from "../types";

async function main() {

  // Connect to Telegram
  console.log("Connecting to Telegram . . . ");
  const string_session: string = process.env.TELEGRAM_STRING_SESSION!;
  const client_telegram: TelegramClient  = await createTelegramClient(string_session);
  console.log();

  // Read Telegram messages
  console.log("Reading messages from 'thecoreloop' channel . . . ");
  const messages: TelegramMessage[] = await readMessages(client_telegram, "thecoreloop");
  for (let i = 0; i < messages.length; i++) {
    const message: TelegramMessage = messages[i];

    // Instantiate <LAG> object
    let lag: LAG = {
      heading: "",
      subheading: "",
      message_id: message.id,
      number: -1,
      date: "",
      content: [],
    };

    try {
      // Parse LAG out of Telegram message
      lag = parseLAG(message);
      console.log(`  LAG #${lag.number} found!`);

      // Write LAG to .json file
      const filepath_json: string = path.join(__dirname, "../../LAG/json/", `lag-${String(lag.number).padStart(3, "0")}.json`);
      fs.writeFileSync(
        filepath_json,
        JSON.stringify(lag, null, 2),
      );
    } catch (error) {
      continue;
    }
  }

  console.log("\nFetching metadata for LAG posts . . . ");
  const lag_filenames: string[] = fs.readdirSync(path.join(__dirname, "../../LAG/json/"));
  for (const filename of lag_filenames) {
    let lag_number: number = 0;
    try {
      const filepath_json: string = path.join(__dirname, "../../LAG/json/", filename);
      const lag: LAG = JSON.parse(fs.readFileSync(filepath_json, { encoding: "utf-8" }));
      lag_number = lag.number;

      if (lag_number <= 91) continue;

      console.log(`  LAG #${lag.number} . . . `);
      const lag_meta: LAG = await attachMetadata(lag, true);
      const filepath_meta: string = path.join(__dirname, "../../LAG/meta/", `lag-${String(lag_meta.number).padStart(3, "0")}.json`);
      fs.writeFileSync(
        filepath_meta,
        JSON.stringify(lag_meta, null, 2),
      );
    } catch (error) {
      console.log(`  Something went wrong while processing: LAG #${lag_number}`);
      console.log(error);
    }
  }
}

main()
  .then(() => process.exit(0));


