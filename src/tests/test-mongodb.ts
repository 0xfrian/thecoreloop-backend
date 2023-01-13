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
import { createMongoDBClient, setLatestLAG } from "../modules/mongodb";

async function main(): Promise<void> {
  // Connect to MongoDB
  console.log("Connecting to MongoDB . . .");
  const uri: string = process.env.MONGODB_URI!;
  const client: MongoClient = await createMongoDBClient(uri);

  // Set latest LAG number on MongoDB
  console.log("Setting Latest LAG . . . ");
  const response: any = await setLatestLAG(client, 131);
  console.log("Response: ", response);
}

main()
  .then(() => process.exit(0));

