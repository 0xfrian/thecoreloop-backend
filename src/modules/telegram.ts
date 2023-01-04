// Node Modules
require('dotenv').config();
const input = require("input");
import { Api, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { LogLevel } from "telegram/extensions/Logger";

// Types
import { TelegramMessage } from "../types";

// Telegram API keys
const API_ID: number = Number(process.env.TELEGRAM_API_ID)!;
const API_HASH: string = process.env.TELEGRAM_API_HASH!;

// Create <TelegramClient> object; requires Telegram user credentials 
export async function createTelegramClient(string_session: string = ""): Promise<TelegramClient> {
  const client: TelegramClient = new TelegramClient(
    new StringSession(string_session),
    API_ID,
    API_HASH,
    { connectionRetries: 5 },
  );

  // If string_session is undefined/invalid, then prompt user for credentials
  if (string_session == "" || !client) {
    await client.start({
      phoneNumber: async () => await input.text("Phone Number (include +1 for US): "),
      password: async () => await input.password("Password: "),
      phoneCode: async () => await input.text("Authentication Code (sent via Telegram): "),
      onError: (error: Error) => console.log(error),
    });
  }

  // Try connecting to Telegram
  try {
    await client.connect();
    
    // Optional: console-log StringSession to terminal
    // console.log("Session String: ", client.session.save());
  } catch (error) {
    console.log(error);
  }

  // Disable Telegram event logging
  client.setLogLevel(LogLevel.NONE);

  return client;
}

// Read Telegram message(s)
export async function readMessages(client: TelegramClient, channel: string): Promise<TelegramMessage[]> {
  // Construct array of <InputMessageID> objects representing Telegram message IDs
  const number_array: number[] = [];
  for (let i = 1; i <= 10000; i++) number_array.push(i);
  let message_ids: Api.InputMessageID[] = number_array.map(num => new Api.InputMessageID({ id: num }));

  // Read Telegram messages
  // - TODO: Assign more specific type to response variable
  const response: any = await client.invoke(new Api.channels.GetMessages({ 
    channel: channel,
    id: message_ids,
  }));

  // Parse text content from non-empty Telegram messages
  // - TODO: Assign more specific type to message variable
  let messages_nonempty: string[] = response.messages
    .map((message: any) => message.message || "")
    .filter((message: any) => message.length > 0);

  // Parse message ID from non-empty Telegram messages
  // - TODO: Assign more specific type to message variable
  let message_ids_nonempty: number[] = response.messages 
    .filter((message: any) => message.message && message.message.length > 0)
    .map((message: any) => message.id);

  // Check if same number of nonempty messages and corresponding message IDs
  if (messages_nonempty.length != message_ids_nonempty.length) {
    throw Error ("Differing number of messages and message IDs in readMessages() call");
  }

  // Construct array of <TelegramMessage> objects 
  const messages: TelegramMessage[] = [];
  for (let i = 0; i < messages_nonempty.length; i++) {
    // Assign message text content and message ID
    const text: string = messages_nonempty[i];
    const id: number = message_ids_nonempty[i];

    // Instantiate <TelegramMessage> object
    const message: TelegramMessage = {
      text: text, 
      id: id,
    };
    messages.push(message);
  }

  return messages;
}

