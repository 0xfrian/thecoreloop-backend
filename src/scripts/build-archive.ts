// Enable environmental variables
require('dotenv').config();

// Node Modules
import fs from "fs";
import path from "path";
const input = require("input");

// Local modules
import { 
  createMongoDBClient,  
  createLAG, 
  deleteLAGCollection,
  setLatestLAG,
} from "../modules/mongodb";
import { parseLAG, attachMetadata } from "../modules/lag";
import { createTelegramClient, readMessages  } from "../modules/telegram";

// Types 
import { MongoClient } from "mongodb";
import { TelegramClient } from "telegram";
import { TelegramMessage, LAG } from "../types";

// Build Archive from scratch: [DANGEROUS] Builds LAG Archive from 
//  scratch, overwriting existing data and metadata, appending to MongoDB.
export default async function main(): Promise<void> {
  // Connect to Telegram
  console.log("Connecting to Telegram . . . ");
  const string_session: string = process.env.TELEGRAM_STRING_SESSION!;
  const client_telegram: TelegramClient  = await createTelegramClient(string_session);

  // Read Telegram messages
  console.log("\nReading messages from 'thecoreloop' channel . . . ");
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
      number: -1,
      date: "",
      special_insights: "",
      content: [],
    };

    try {
      // Parse LAG out of Telegram message
      lag = parseLAG(message);
      if (!multi_message) console.log(`    ??? LAG #${lag.number} found!`);
      else console.log(`    ??? extension of LAG #${lag.number} found!`);

      // Write LAG to .json file
      const filepath_json: string = path.join(__dirname, "../../LAG/json/", `lag-${String(lag.number).padStart(3, "0")}.json`);
      console.log(`    ??? Writing file: ./${filepath_json.split("/").slice(-3).join("/")}`);
      fs.writeFileSync(
        filepath_json,
        JSON.stringify(lag, null, 2),
      );
    } catch (error: any) {
      console.log(`    ??? ${error.message}`);
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
  
  // Connect to MongoDB
  console.log("\nConnecting to MongoDB . . . ");
  const mongodb_uri: string = process.env.MONGODB_URI!;
  const client: MongoClient = await createMongoDBClient(mongodb_uri);

  // Reset LAG Collection
  console.log("\nResetting LAG Collection . . . ");
  await deleteLAGCollection(client);

  // Uploading LAG collection from meta/ directory
  console.log("\nUploading LAG Collection . . . ");
  const filenames: string[] = fs.readdirSync(path.join(__dirname, "../../LAG/meta/"));
  for (const filename of filenames) {
    const filepath: string = path.join(__dirname, "../../LAG/meta/", filename);
    const lag: LAG = JSON.parse(fs.readFileSync(filepath, { encoding: "utf-8" }));
    console.log(`  LAG #${lag.number} . . . `);
    await createLAG(client, lag);
    await setLatestLAG(client, lag.number);
  }
}

