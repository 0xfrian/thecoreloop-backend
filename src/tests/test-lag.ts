// Enable environmental variables
require('dotenv').config();

// Node Modules
import fs from "fs";
import path from "path";

// Local modules
import { unfurl_js } from "../modules/link-preview";
import { parseLAG, attachMetadata } from "../modules/lag";
import { createTelegramClient, readMessages  } from "../modules/telegram";

// Types 
import { TelegramClient } from "telegram";
import { TelegramMessage, LAG } from "../types";

async function main() {
  // console.log("Reading LAG Archive...");
  // const dir_json: string = path.join(__dirname, "../../LAG/json/");
  // const filenames_json: string[] = fs.readdirSync(dir_json);
  // for (const filename_json of filenames_json) {
  //   const lag: LAG = JSON.parse(fs.readFileSync(
  //     path.join(dir_json, filename_json),
  //     { encoding: "utf-8"},
  //   ));
  //   if (lag.number != 106) continue;
  //   console.log(lag);
  //   console.log();
  // }
  
  console.log("Connecting to Telegram . . . ");
  const string_session: string = process.env.TELEGRAM_STRING_SESSION!;
  const client_telegram: TelegramClient  = await createTelegramClient(string_session);

  console.log("\nReading messages from 'thecoreloop' channel . . . ");
  const messages: TelegramMessage[] = await readMessages(client_telegram, "thecoreloop");

  console.log("\nParsing LAG content...");
  for (let i = 0; i < messages.length; i++) {
    const message: TelegramMessage = messages[i];
    try {
      const lag: LAG = parseLAG(message, false);
      if (lag.number != 106) continue;
      console.log(lag);
    } catch (error) {
      console.log(`  ${error}`);
    }
  }
}

main()
  .then(() => process.exit(0));

