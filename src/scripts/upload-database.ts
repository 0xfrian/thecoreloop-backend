// Enable environmental variables
require('dotenv').config();

// Node Modules
import fs from "fs";
import path from "path";

// Local modules
import { 
  createMongoDBClient,  
  createLAG, 
  deleteLAGCollection,
} from "../modules/mongodb";

// Types 
import { LAG } from "../types";
import { MongoClient } from "mongodb";

async function main() {
  // Connect to MongoDB
  console.log("Connecting to MongoDB . . . ");
  const mongodb_uri: string = process.env.MONGODB_URI!;
  const client: MongoClient = await createMongoDBClient(mongodb_uri);

  // Reset LAG Collection
  console.log("Resetting LAG Collection . . . ");
  await deleteLAGCollection(client);

  // Uploading LAG collection from meta/ directory
  console.log("Uploading LAG Collection . . . ");
  const filenames: string[] = fs.readdirSync(path.join(__dirname, "../../LAG/meta/"));
  for (const filename of filenames) {
    const filepath: string = path.join(__dirname, "../../LAG/meta/", filename);
    const lag: LAG = JSON.parse(fs.readFileSync(filepath, { encoding: "utf-8" }));
    console.log(`  LAG #${lag.number} . . . `);
    await createLAG(client, lag);
  }
}

main()
  .then(() => process.exit(0));


