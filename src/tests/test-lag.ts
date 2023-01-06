// Enable environmental variables
require('dotenv').config();

// Node Modules
import fs from "fs";
import path from "path";

// Local modules
import previewLink from "../modules/link-preview";
import { parseLAG, attachMetadata } from "../modules/lag";
import { createTelegramClient, readMessages  } from "../modules/telegram";
import { 
  createMongoDBClient,  
  createLAG, 
  updateLAG,
  deleteLAGCollection,
} from "../modules/mongodb";

// Types 
import { MongoClient } from "mongodb";
import { TelegramClient } from "telegram";
import { TelegramMessage, LAG, Article, ArticleGroup, LinkPreview } from "../types";

async function main() {
  console.log("Connecting to Telegram . . . ");
  const string_session: string = process.env.TELEGRAM_STRING_SESSION!;
  const client_telegram: TelegramClient  = await createTelegramClient(string_session);
  console.log();

  console.log("Reading messages from 'thecoreloop' channel . . . ");
  const messages: TelegramMessage[] = await readMessages(client_telegram, "thecoreloop");
  console.log();

  for (let i = 0; i < messages.length; i++) {
    const message: TelegramMessage = messages[i];
    try {
      const lag: LAG = parseLAG(message);

      console.log(`Fetching metadata for: ${lag.heading}`);
      const lag_meta: LAG = lag;
      const content_meta: ArticleGroup[] = [];
      for (const article_group of lag.content) {
        // Skip special insights section
        if (article_group.category.includes("SPECIAL INSIGHTS")) continue;

        console.log(`  ${article_group.category}`);
        const article_group_meta: ArticleGroup = {
          category: article_group.category,
          articles: [],
        };

        for (const article of article_group.articles) {
          console.log(`    Previewing: ${article.url}`);
          const link_preview: LinkPreview = await previewLink(article.url);
          const article_meta: Article = {
            ...article, 
            title: link_preview.title,
            description: link_preview.description,
            image: link_preview.image,
            source: link_preview.source,
          };

          article_group_meta.articles.push(article_meta);
        }

        content_meta.push(article_group_meta);
      }

      lag_meta.content = content_meta;

      const filepath: string = path.join(__dirname, "../../LAG/", `lag-${String(lag.number).padStart(3, "0")}.json`);
      console.log(`Writing file: ${filepath}`);
      fs.writeFileSync(
        filepath,
        JSON.stringify(lag_meta, null, 2),
      );
      console.log();
    } catch (error) {
      console.log(`    ${error}`);
    }
  }
  console.log();
}

main()
  .then(() => process.exit(0));


