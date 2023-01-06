// Enable environmental variables
require('dotenv').config();

// Local modules
import { parseLAG } from "../modules/lag";
import { createTelegramClient, readMessages  } from "../modules/telegram";

// Types 
import { TelegramClient } from "telegram";
import { TelegramMessage, LAG } from "../types";

async function main() {
  console.log("Connecting to Telegram . . . ");
  const string_session: string = process.env.TELEGRAM_STRING_SESSION!;
  const client: TelegramClient  = await createTelegramClient(string_session);
  console.log();

  console.log("Reading messages from 'thecoreloop' channel . . . ");
  const messages: TelegramMessage[] = await readMessages(client, "thecoreloop");

  console.log("Messages: ");
  for (const message of messages) {
    try {
      const lag: LAG = parseLAG(message);
      console.log(`  Look at Gaming #${lag.number} | ${lag.date}`);
    } catch (error) {
      continue;
    }
  }
}

main()
  .then(() => process.exit(0));

