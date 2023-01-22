import fs from "fs";
import path from "path";
import { createGSheet, readGSheet } from "../modules/gsheets";

import { LAG } from "../types";

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {

}

main()
  .then(() => process.exit(0));

