require('dotenv').config();
import fs from "fs";
import path from "path";
import { createGSheet, readGSheet } from "../modules/gsheets";

import { GCreds, LAG } from "../types";

async function main() {
  // Google Sheets Credentials
  const creds: GCreds = {
    client_email: process.env.GSHEETS_EMAIL!,
    private_key: process.env.GSHEETS_KEY!,
  };
  const gsheet_id: string = process.env.GSHEETS_ASDF_ID!;

  // Files
  const lag_json_dir: string = path.join(__dirname, "../../LAG/json/");
  const lag_json_filenames: string[] = fs.readdirSync(lag_json_dir).reverse();
  for (const filename of lag_json_filenames) {
    const lag: LAG = JSON.parse(fs.readFileSync(
      path.join(lag_json_dir, filename),
      { encoding: "utf-8" },
    ));
    const gsheet_title: string = `LAG #${lag.number}`;
    console.log(`Creating Google Sheet: ${gsheet_title}`);
    try {
      await createGSheet(creds, gsheet_id, gsheet_title);
    } catch (error: any) {
      if (error.message.includes("Quota exceeded")) {
        console.log("Quota exceed; Trying again...");
        await createGSheet(creds, gsheet_id, gsheet_title);
      } else {
        console.log(error.message);
        return;
      }
    }
  }
}

main()
  .then(() => process.exit(0));

