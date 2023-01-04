// Enable environmental variables
require('dotenv').config();

// Types
import { LAG, formatString } from "../modules/lag";
import { MongoClient } from "mongodb";

// MongoDB functions
import { createMongoDBClient, readLAG } from "../modules/mongodb";

async function main(): Promise<void> {
  console.log("Connecting to MongoDB . . .");
  const uri: string = process.env.MONGODB_URI!;
  const client: MongoClient = await createMongoDBClient(uri);
  console.log("Reading LAG #124 . . . ");
  const lag: LAG = await readLAG(client, 124);
  console.log(formatString(lag));
}

main()
  .then(() => process.exit(0));

