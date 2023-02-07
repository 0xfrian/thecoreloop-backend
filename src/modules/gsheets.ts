require('dotenv').config();
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

