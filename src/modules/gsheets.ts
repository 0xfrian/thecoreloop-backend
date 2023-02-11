require('dotenv').config();
import { LAG } from "../types";
const { GoogleSpreadsheet } = require("google-spreadsheet");

function filterString(s: string): string {
  return s.trim().replace("\t", "").replace("\n", "");
}

export async function createGSheet(
  creds: any, 
  gsheet_id: string,
  sheet_title: string
) {
  // Read Google Sheets document
  const doc = new GoogleSpreadsheet(gsheet_id);
  await doc.useServiceAccountAuth({
    client_email: creds.client_email, 
    private_key: creds.private_key, 
  });
  await doc.loadInfo();

  try {
    const new_sheet = await doc.addSheet();
    await new_sheet.updateProperties({ title: sheet_title });
    return new_sheet;
  } catch (error: any) {
    if (error.message.includes("already exists")) {
      throw new Error(
        `Error 409 (Conflict): Sheet '${sheet_title}' already exists`
      );
    } else throw error;
  }
}

export async function readGSheet(
  creds: any, 
  gsheet_id: string, 
  sheet_title: string
) {
  // Read Google Sheets document
  const doc = new GoogleSpreadsheet(gsheet_id);
  await doc.useServiceAccountAuth({
    client_email: creds.client_email, 
    private_key: creds.private_key, 
  });
  await doc.loadInfo();
  
  try {
    // Read sheet
    const sheet = doc.sheetsByTitle[sheet_title];
    if (sheet == undefined) throw Error(
      `Error 404 (Not Found): Sheet '${sheet_title}' not found`
    ); 
    return sheet;
  } catch (error: any) {
    throw error;
  }
}

export async function parseGSheet(sheet: any) {
  // Load header values
  await sheet.loadHeaderRow();

  // Assign headers
  const headers = sheet.headerValues.map((header: string) => 
    filterString(header));
  
  // Assign rows
  const rows = (await sheet.getRows())
    .map((row: any) => row._rawData.map((cell: any) => filterString(cell)));

  // Check row dimensions
  // Note: GSheets API excludes empty cells near the last column
  for (const [row_num, row] of rows.entries()) {
    if (row.length < headers.length) {
      // Fill in for empty cells that may have been removed
      while (row.length < headers.length) row.push("");
    } else if (row.length > headers.length) {
      // Log error if the # of row entries exceeds the # of headers
      console.log(`Row #${row_num} entries exceeds number of headers!`);
    }
  }

  // Organize data to contain headers and rows
  let data: any = { headers, rows };
  return data;
}

export function buildRows(lag: LAG): string[][] {

  // Build array of rows
  const empty_row: string[] = [""];
  const rows_lag: string[][] = [];

  rows_lag.push([`${lag.heading} | ${lag.date}`]);  // Heading (with date)
  if (lag.subheading) {                             // Subheading
    rows_lag.push(empty_row);
    rows_lag.push([lag.subheading]);
  } 

  rows_lag.push(empty_row);
  rows_lag.push(empty_row);

  // Special Insights section
  if (lag.special_insights) {
    rows_lag.push([
      "‼️ SPECIAL INSIGHTS 👀\n" 
      + lag.special_insights
    ]);
    rows_lag.push(empty_row);
    rows_lag.push(empty_row);
  }

  // Categories + Articles
  for (const [i, article_group] of lag.content.entries()) {
    rows_lag.push([article_group.category])
    for (const [j, article] of article_group.articles.entries()) {
      rows_lag.push([article.caption]);
      rows_lag.push([article.url])
      const last_article: boolean = j == article_group.articles.length-1;
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

  return rows_lag;
}

export async function getLatestLAG(
  creds: any, 
  gsheet_id: string,
): Promise<number> {
  // Read Google Sheets document
  const doc = new GoogleSpreadsheet(gsheet_id);
  await doc.useServiceAccountAuth({
    client_email: creds.client_email, 
    private_key: creds.private_key, 
  });
  await doc.loadInfo();

  // Parse latest LAG number
  let latest_LAG_number: number = 0;
  for (const key of Object.keys(doc._rawSheets)) {
    const sheet: any = doc._rawSheets[key];
    const sheet_title: string = sheet._rawProperties.title;
    try {
      const lag_number: number = Number(sheet_title.slice(5));
      if (lag_number > latest_LAG_number) latest_LAG_number = lag_number;
    } catch (error) {
      continue;
    }
  }
  return latest_LAG_number;
}

