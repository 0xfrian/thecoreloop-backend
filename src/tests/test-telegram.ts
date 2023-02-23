import * as dotenv from "dotenv";
dotenv.config()

import { parseLAG } from "../modules/lag";
import { createTelegramClient, getParticipants, readMessages } from "../modules/telegram";

import { Api, TelegramClient } from "telegram";
import { TelegramMessage, LAG } from "../types";

async function main() {
  console.log("Connecting to Telegram . . . ");
  const string_session: string = process.env.TELEGRAM_STRING_SESSION!;
  const client: TelegramClient  = await createTelegramClient(string_session);
  console.log();

  // Get participants 
  console.log("Getting participants in 'thecoreloop' channel . . . ");
  const response: any = await getParticipants(client, "thecoreloop");

  const users: any = response.users;
  console.log("Participants: ", users.length);
  for (let i = 0; i < users.length; i++) {
    const user: any = users[i];
    const first_name: string = user.firstName || "";
    const last_name: string = user.lastName || "";
    const username: string = user.username || "";
    console.log(`  User #${i+1}: ${first_name} ${last_name} (${username})`);
  }

  // Read messages
  // console.log("Reading messages from 'thecoreloop' channel . . . ");
  // const messages: TelegramMessage[] = await readMessages(client, "thecoreloop");

  // Print messages
  // console.log("Messages: ");
  // for (const message of messages) {
  //   try {
  //     const lag: LAG = parseLAG(message);
  //     console.log(`  Look at Gaming #${lag.number} | ${lag.date}`);
  //   } catch (error) {
  //     continue;
  //   }
  // }
}

main()
  .then(() => process.exit(0));

