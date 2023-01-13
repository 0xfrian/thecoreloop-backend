// Enable environmental variables
require('dotenv').config();

// Node Modules
import fs from "fs";
import path from "path";

// Local Modules
import { formatString } from "../modules/lag";

// Types
import { LAG } from "../types";
import { MongoClient } from "mongodb";

// MongoDB functions
import { createMongoDBClient, updateLAG } from "../modules/mongodb";

async function main(): Promise<void> {
  // Connect to MongoDB
  console.log("Connecting to MongoDB . . .");
  const uri: string = process.env.MONGODB_URI!;
  const client: MongoClient = await createMongoDBClient(uri);

  // Read LAG .json file
  const lag: LAG = JSON.parse(fs.readFileSync(path.join(__dirname, "../../LAG/meta/lag-130.json"), { encoding: "utf-8" }));

  // Update LAG in MongoDB 
  console.log(`Updating LAG #${lag.number}`);
  await updateLAG(client, 130, lag);
}

main()
  .then(() => process.exit(0));

