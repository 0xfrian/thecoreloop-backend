// Enable environmental variables
require('dotenv').config();

// Node Modules
import fs from "fs";
import path from "path";

// Local modules
import { 
  createMongoDBClient,  
  createLAG,
  setLatestLAG,
} from "../modules/mongodb";
import { delay } from "../modules/helper";
import { parseLAG, attachMetadata } from "../modules/lag";
import { createTelegramClient, readMessages  } from "../modules/telegram";
import { createGSheet, readGSheet, buildRows } from "../modules/gsheets";

// Types 
import { MongoClient } from "mongodb";
import { TelegramClient } from "telegram";
import { GCreds, TelegramMessage, LAG } from "../types";

// Update Archive: Updates LAG Archive based on latest LAG in /LAG/meta/
//  directory, pushing new LAG posts to MongoDB
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

  // Fetch metadata for LAG Collection
  console.log("\nFetching metadata for LAG posts . . . ");
  const filenames_json: string[] = fs.readdirSync(path.join(__dirname, "../../LAG/json/"));
  const filenames_meta: string[] = fs.readdirSync(path.join(__dirname, "../../LAG/meta/"));
  // Obtain current latest LAG number from local /LAG/meta/ directory
  const latest_json: number = Number(filenames_meta[filenames_meta.length-1].slice(4, 7));
  const new_lags: number[] = [];
  for (const filename of filenames_json) {
    let lag_number: number = 0;
    try {
      // Read LAG .json file
      const filepath_json: string = path.join(__dirname, "../../LAG/json/", filename);
      const lag: LAG = JSON.parse(fs.readFileSync(filepath_json, { encoding: "utf-8" }));
      lag_number = lag.number;
      
      // Skip if NOT a new LAG post
      if (lag_number <= latest_json) continue;

      // At this point, current LAG is assumed to be new
      new_lags.push(lag_number);

      // Fetch metadata
      console.log(`  LAG #${lag.number} . . . `);
      const lag_meta: LAG = await attachMetadata(lag, true);

      // Write LAG to .json file
      const filepath_meta: string = path.join(__dirname, "../../LAG/meta/", `lag-${String(lag_meta.number).padStart(3, "0")}.json`);
      fs.writeFileSync(
        filepath_meta,
        JSON.stringify(lag_meta, null, 2),
      );
    } catch (error) {
      console.log(`  Something went wrong with LAG #${lag_number}`);
      console.log(error);
    }
  }

  // Connect to MongoDB
  console.log("\nConnecting to MongoDB . . . ");
  const mongodb_uri: string = process.env.MONGODB_URI!;
  const client: MongoClient = await createMongoDBClient(mongodb_uri);

  // Upload new LAG(s) to MongoDB
  console.log("\nPushing to MongoDB . . . ");
  for (const lag_number of new_lags) {
    try {
      // Create LAG document
      const filepath: string = path.join(__dirname, "../../LAG/meta/", `lag-${lag_number.toString().padStart(3, "0")}.json`)
      const lag: LAG = JSON.parse(fs.readFileSync(filepath, { encoding: "utf-8" }));
      console.log(`  LAG #${lag_number} . . . `);
      await createLAG(client, lag);

      // Update Latest LAG number
      await setLatestLAG(client, lag.number);
    } catch (error) {
      console.log(`  ${error}`);
    }
  }

  // Upload new LAG(s) to Google Sheets
  console.log("\nPushing to Google Sheets . . . ");
  // Google Sheets Credentials
  const creds: GCreds = {
    client_email: process.env.GSHEETS_EMAIL!,
    private_key: process.env.GSHEETS_KEY!,
  };
  const gsheet_id: string = process.env.GSHEETS_LAG_ARCHIVE_ID!;
  for (const lag_number of new_lags) {
    try {
      const filepath: string = path.join(__dirname, "../../LAG/json/", `lag-${lag_number.toString().padStart(3, "0")}.json`)
      const lag: LAG = JSON.parse(fs.readFileSync(filepath, { encoding: "utf-8" }));
      console.log(`  LAG #${lag_number} . . . `);
      
      // Build rows array
      const rows_lag = buildRows(lag)

      // Upload to Google Sheets
      const sheet_title: string = `LAG #${lag.number}`;
      let task: string = "Create";
      let lag_uploaded = false;
      while (!lag_uploaded) {
        try {
          if (task == "Create") {
            // Create new sheet
            const sheet_lag = await createGSheet(
              creds, 
              gsheet_id, 
              sheet_title
            );
            await sheet_lag.setHeaderRow(["Content"]);
            await sheet_lag.addRows(rows_lag);
            lag_uploaded = true;
          } else if (task == "Read") {
            // Read sheet
            const sheet_lag = await readGSheet(
              creds, 
              gsheet_id, 
              sheet_title
            );
            await sheet_lag.clearRows();
            await sheet_lag.setHeaderRow(["Content"]);
            await sheet_lag.addRows(rows_lag);
            lag_uploaded = true;
          } else if (task == "Wait") {
            // Wait 60 seconds for API quota to refresh
            console.log(` ﬌ Sleeping for 60 seconds...`);
            await delay(60000);
            task = "Create";
          }
        } catch (error: any) {
          // If API quota exceeded, then wait 
          if (error.message.includes("Quota exceeded")) task = "Wait";
          // If sheet is missing, create new sheet
          else if (error.message.includes("404")) task = "Create";
          // If sheet already exists, then read sheet
          else if (error.message.includes("409")) task = "Read";
          else console.log(error.message);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
}

