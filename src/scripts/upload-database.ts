// Enable environmental variables
require('dotenv').config();

// Local modules
import { parseLAG, attachMetadata } from "../modules/lag";
import { 
  createMongoDBClient,  
  createLAG, 
  updateLAG,
  deleteLAGCollection,
} from "../modules/mongodb";

// Types 
import { MongoClient } from "mongodb";
import { TelegramMessage, LAG } from "../types";

async function main() {
  console.log("Connecting to MongoDB . . . ");
  const mongodb_uri: string = process.env.MONGODB_URI!;
  const client_mongodb: MongoClient = await createMongoDBClient(mongodb_uri);

  console.log("Resetting LAG Collection . . . ");
  await deleteLAGCollection(client_mongodb);

  console.log("Uploading LAG posts . . . ");
  for (let i = 0; i < messages.length; i++) {
    const message: TelegramMessage = messages[i];
    try {
      const lag: LAG = parseLAG(message);
      const lag_meta: LAG = await attachMetadata(lag);
      await createLAG(client_mongodb, lag_meta);
      console.log(`  Uploaded: ${lag.heading}`);
    } catch (error) {
      if (message.text.includes("We hit Telegram's text limit today")) {
        const combined_message: TelegramMessage = {
          text: messages[i-1].text + "\n" + messages[i].text,
          id: messages[i-1].id,
        };
        const lag: LAG = parseLAG(combined_message);
        const lag_meta: LAG = await attachMetadata(lag);
        await updateLAG(client_mongodb, lag.number, lag_meta);
        console.log(`  Updated: ${lag.heading}`);
      }
      else console.log(`  ${error}`);
    }
  }
  console.log();
}

main()
  .then(() => process.exit(0));


