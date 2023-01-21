import fs from "fs";
import path from "path";
import { createGSheet, readGSheets } from "../modules/gsheets";

import { LAG } from "../types";

async function main() {
  try {
    // Assign Google Sheets credentials
    const creds: any = {
      client_email: process.env.GSHEETS_EMAIL!,
      private_key: process.env.GSHEETS_KEY!,
    };
    const gsheet_id: string = process.env.GSHEETS_LAG_ARCHIVE_ID!;

    // Define useful constants
    const dir_json = path.join(__dirname, "../../LAG/json");
    const filenames_json = fs.readdirSync(dir_json);
    const empty_row = [""];

    // Build data to upload to Google Sheets
    console.log("Reading LAG Archive...");
    for (const filename_json of filenames_json) {
      // Read LAG .json file
      const lag: LAG = JSON.parse(fs.readFileSync(
        path.join(dir_json, filename_json),
        { encoding: "utf-8" },
      ));

      console.log(` ﬌ LAG #${lag.number}...`);

      const rows_lag = [];  // NOTE: only 1 entry per row
      rows_lag.push([`${lag.heading} | ${lag.date}`]);
      if (lag.subheading) {
        rows_lag.push(empty_row);
        rows_lag.push([lag.subheading]);
      } 
      rows_lag.push(empty_row);
      rows_lag.push(empty_row);
      if (lag.special_insights) {
        rows_lag.push([
          "‼️ SPECIAL INSIGHTS 👀\n" 
          + lag.special_insights
        ]);
        rows_lag.push(empty_row);
        rows_lag.push(empty_row);
      }

      for (const [i, category_group] of lag.content.entries()) {
        rows_lag.push([category_group.category])
        for (const [j, article] of category_group.articles.entries()) {
          rows_lag.push([article.caption]);
          rows_lag.push([article.url])
          const last_article: boolean = j == category_group.articles.length-1;
          if (!last_article) {
            rows_lag.push(empty_row);
          }
        }
        const last_category: boolean = i == lag.content.length-1;
        if (!last_category) {
          rows_lag.push(empty_row);
          rows_lag.push(empty_row);
        }
      }

      const sheet_title: string = `LAG #${lag.number}`;
      try {
        let sheet_lag = await readGSheets(creds, gsheet_id, sheet_title)
        if (sheet_lag) {
          await sheet_lag.clearRows();
        } else {
          sheet_lag = await createGSheet(creds, gsheet_id, sheet_title);
          await sheet_lag.setHeaderRow(["Content"]);
        }
        await sheet_lag.addRows(rows_lag);
      } catch (error: any) {
        console.log(error);
      }
    }
  } catch (error: any) {
    console.log(error.message ? error.message : error);
  }
}

main()
  .then(() => process.exit(0));

