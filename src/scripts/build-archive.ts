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
    let message: TelegramMessage = messages[i];

    // Console-log first line of message
    console.log(`  Message #${message.id}: "${message.text.split("\n")[0]}"`);

    let multi_message: boolean = false;
    if (message.text.includes("We hit Telegram's text limit today")) {
      // In the case of a LAG post spanning across 2 messages . . . 
      multi_message = true;

      // Assign previous message
      const prev_message: TelegramMessage = messages[i-1];

      // Redefine message, combining text together and assuming previous message ID
      message = {
        text: prev_message.text + "\n" + message.text,
        id: prev_message.id,
      };
    }

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
      if (!multi_message) console.log(`    ﬌ LAG #${lag.number} found!`);
      else console.log(`    ﬌ extension of LAG #${lag.number} found!`);

      // Write LAG to .json file
      const filepath_json: string = path.join(__dirname, "../../LAG/json/", `lag-${String(lag.number).padStart(3, "0")}.json`);
      fs.writeFileSync(
        filepath_json,
        JSON.stringify(lag, null, 2),
      );
    } catch (error) {
      console.log(`    ﬌ ${error}`);
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

      if (lag_number != 124) continue;

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


