// Enable environmental variables
require('dotenv').config();

// Node Modules
import fs from "fs";
import path from "path";
const input = require("input");

// Local modules
import { 
  createMongoDBClient,  
  updateLAG,
} from "../modules/mongodb";

// Types 
import { LAG } from "../types";
import { MongoClient } from "mongodb";

export default async function main(): Promise<void> {
  const user_input: string = await input.text(
    "Which LAG(s) would you like to patch? (separate with commas)",
    { default: "None" },
  );

  // Skip if user_input is empty
  if (user_input == "None") return;
  let lag_numbers: number[] = [];
  try {
    lag_numbers = user_input.split(",").map(lag_number => Number(lag_number.trim()));
  } catch (error) {
    console.log("Invalid LAG number(s): ", user_input);
    console.log(error);
  }

  // Connect to MongoDB
  console.log("\nConnecting to MongoDB . . . ");
  const mongodb_uri: string = process.env.MONGODB_URI!;
  const client: MongoClient = await createMongoDBClient(mongodb_uri);

  console.log("\nPatching LAGs . . . ");
  for (const lag_number of lag_numbers) {
    try {
      const filepath: string = path.join(__dirname, "../../LAG/meta/", `lag-${lag_number.toString().padStart(3, "0")}.json`);
      const lag: LAG = JSON.parse(fs.readFileSync(filepath, { encoding: "utf-8" }));
      console.log(`  LAG #${lag_number} . . . `)
      await updateLAG(client, lag_number, lag);
    } catch (error) {
      console.log(`  Something went wrong while processing LAG #${lag_number}`);
      console.log(`  ${error}`);
    }
  }
}

