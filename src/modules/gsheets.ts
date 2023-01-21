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

  const new_sheet = await doc.addSheet();
  await new_sheet.updateProperties({ title: sheet_title });
  return new_sheet;
}

export async function readGSheets(
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
  
  // Read sheet
  const sheet = doc.sheetsByTitle[sheet_title];
  if (sheet) await sheet.loadHeaderRow();
  else return undefined;

  return sheet;
}

export async function parseSheet(sheet: any) {
  const headers = sheet.headerValues.map((header: string) => 
    filterString(header));
  const _rows = await sheet.getRows();
  const rows = _rows.map((row: any) => 
    row._rawData.map((cell: any) => filterString(cell)));

  // Check row dimensions
  // Note: GSheets API excludes empty cells near the last column
  for (const [row_num, row] of rows.entries()) {
    if (row.length < headers.length) {
      // Fill in for empty cells that may have been removed
      while (row.length < headers.length) row.push("");
    } else if (row.length > headers.length) {
      // Throw error if the # of row entries exceeds the # of headers
      throw Error(
        `Number of elements in Row #${row_num} \
        exceeds number of headers!`
      );
    }
  }

  // Organize data
  let data: any = { headers, rows };
  for (const [col_num, header] of headers.entries()) {
    // Assign object property to be named after column header
    data[header] = [];
    for (const row of rows) {
      // Append corresponding entries under each column header
      data[header].push(row[col_num]);
    }
  }

  return data;
}

