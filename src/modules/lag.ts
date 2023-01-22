// Local Modules
import { unfurl_js } from "../modules/link-preview";
import { parseDate } from "./date";

// Types
import { 
  TelegramMessage, 
  LAG, 
  ArticleGroup, 
  Article, 
  LinkPreview 
} from "../types";

// Constants
export const CATEGORIES: string[] = [
  "🔦 Spotlight 🌟",
  "🌊 MARKET ☎️",
  "💎 Deep Dives 🔎",
  "🌈 Platforms 🏔",
  "✨ Web 3️⃣ + Meta 🌎",
  "🧠 Knowledge Hub 📚",
  "💰 Fundraising 🧧",
  "👾 Game & Stats Releases 🎮",
];
export const LAG_MISSING: number[] = [1, 2, 3, 56, 57, 58, 59, 60, 62];
export const BLACKLIST_ARTICLES: string[] = [
  "https://www.deconstructoroffun.com/newsletter/bdtxbgs", // LAG #6
  "https://www.deconstructoroffun.com/newsletter/wthigo",  // LAG #7
  "https://www.data.ai/en/go/the-state-of-anime-gaming-2022/", // LAG #26
  "https://twitter.com/andy8052/status/1557433547606089728?s=28&t=JmDdB-7dX5cQbUZuTYeIUA", // LAG #29
  "https://naavik.co/pro-blockchain-games/mastering-liquidity-pools", // LAG #32
  "https://www.pocketgamer.biz/news/80008/newzoos-latest-report-offers-sterling-insight-into-cloud-gaming/", // LAG #82
];

// Parse given Telegram message and return <LAG> object
export function parseLAG(
  message: TelegramMessage, 
  debug: boolean = false
): LAG {
  // Initialize <LAG> object
  const lag: LAG = {
    heading: "",
    subheading: "",
    message_id: message.id,
    number: -1,
    date: "",
    special_insights: "",
    content: [],
  };

  // Parse Telegram message
  const lines: string[] = message.text
    .split("\n")                        // split line-by-line
    .filter(line => line.length > 1)    // remove empty lines
    .map(line => line.trim());          // remove surrounding whitespace

  // Parse LAG Heading, Number, and Date
  try {
    // Check if first line contains heading
    if (lines[0].includes("Look at Gaming #")) {
      const heading: string = lines[0];

      if (debug) console.log(`  Heading: ${heading}`);

      // Parse LAG number from heading
      const hashtag_index: number = heading.indexOf("#");
      if (hashtag_index >= 0) {
        const ending_index: number = heading.indexOf(" ", hashtag_index);
        lag.number = Number(heading.slice(hashtag_index+1, ending_index));
        if (isNaN(lag.number)) throw Error("LAG number not found!")
        lag.heading = `Look at Gaming #${lag.number}`;
        if (debug) console.log(`    ﬌ Number: ${lag.number}`)
      } else throw Error("LAG number not found!");

      // Check if LAG number is part of missing LAG collection
      if (LAG_MISSING.includes(lag.number)) {
        throw Error(`Exception: LAG #${lag.number}`);
      }

      // Parse date from heading
      try {
        lag.date = parseDate(heading);
      } catch(error) {
        throw Error(`LAG #${lag.number}: error while parsing date! ${error}`);
      }

      if (debug) console.log(`    ﬌ Date: ${lag.date}`)
    } else throw Error("LAG heading not found!");
  } catch (error) {
    throw error;
  }

  // Parse Special Insights section
  let specialinsights_index: number = -1;
  let spotlight_index: number = -1;
  try {
    // Find line indices containing Special Insights and Spotlight labels
    for (let i = 0; i < lines.length; i++) {
      const line: string = lines[i];
      if (line.includes("‼️ SPECIAL INSIGHTS 👀")) {
        specialinsights_index = i;
      } else if (line.includes("🔦 Spotlight 🌟")) {
        spotlight_index = i;
      }
    }

    // throw error if no spotlight section detected
    if (spotlight_index < 0) {
      throw Error(`Lag #${lag.number}: missing spotlight category`);
    }
    
    // if special insights label is found, then extract its text content
    if (specialinsights_index >= 0) {
      const special_insights: string = lines.slice(
        specialinsights_index+1, 
        spotlight_index
      ).join("\n");
      lag.special_insights = special_insights;
    }

    if (debug) {
      const special_insights_msg: string = lag.special_insights
        .split("\n")
        .filter(line => line.length > 0) 
        .map(line => line.trim())
        .join(" ");
      console.log(`    ﬌ Special Insights: ${special_insights_msg}`);
    }
  } catch (error) {
    throw Error(
      `LAG #${lag.number}: error while parsing Special Insights!`
      + `\n${error}`
    );
  }

  // Parse LAG Categories (index-wise)
  let category_indices: number[] = [];
  try {
    for (let i = 1; i < lines.length; i++) {
      const line: string = lines[i];
      if (isCategory(line)) category_indices.push(i);
    } 
    if (category_indices.length == 0) {
      throw Error(`LAG #${lag.number}: No LAG categories found`);
    }
  } catch (error) {
    throw Error(
      `LAG #${lag.number}: error while parsing categories!`
      + `\n${error}`
    );
  }

  // If second line is NOT a category, then assume subheading 
  //  until 1st category index
  if (category_indices[0] != 1) {
    let end_index: number = specialinsights_index >= 0 
      ? specialinsights_index 
      : spotlight_index;
    lag.subheading = lines.slice(1, end_index).join("\n");
  }

  // Parse LAG articles
  let content: ArticleGroup[] = [];
  if (debug) console.log(`  Content: `);
  for (let j = 0; j < category_indices.length; j++) {
    // Assign index representing start of category (including label)
    const current_index: number = category_indices[j]
    
    // Assign index representing end of category
    const next_index: number = (j < category_indices.length-1) 
      ? category_indices[j+1]
      : lines.length;

    // Assign category
    let category: string = lines[current_index];
    if (category.toLowerCase().includes("platforms")) {
      category = "🌈 Platforms ⛰️";  // change mountain emoji
    }

    if (debug) console.log(`    ﬌ ${category}`);

    // Check if there is an even number of lines between categories
    if (Math.abs(current_index+1 - next_index) % 2 != 0) {
      throw Error(
        `LAG #${lag.number}: Uneven number of captions & URLs under category:`
        + ` ${category}`
      );
    }

    // Instantiate <ArticleGroup> object
    let article_group: ArticleGroup = {
      category: category,
      articles: [],
    };

    // Iterate pair-wise through captions & URLs until next category index
    for (let k = current_index+1; k < next_index-1; k+=2) {
      // Skip if line marks end of LAG post
      if (lines[k].includes("—————")) continue;

      // Instantiate <Entry> object, assigning caption and url
      const article: Article = {
        caption: lines[k],
        url: lines[k+1],
      };
      if (debug) console.log(`      ﬌ ${article.caption}`);
      if (debug) console.log(`      ﬌ ${article.url}`);

      // Check if URL is valid
      if (!isURL(article.url)) {
        throw Error(`LAG #${lag.number}: ${category} contains invalid url:`
        + ` ${article.url}`);
      }

      // Append <Article> to articles array
      article_group.articles.push(article);
    }

    // Append <ArticleGroup> to content array 
    content.push(article_group);
  }
  if (debug) console.log();

  // Assign content property
  lag.content = content;

  return lag;
}

// Check if given string contains a URL
export function isURL(line: string): boolean {
  return Boolean(new URL(line));
}

// Fetches metadata for each article in given LAG post
export async function attachMetadata(
  lag: LAG, 
  debug: boolean=false
): Promise<LAG> {
  // Instantiate new <LAG> object to be filled with metadata
  const lag_meta: LAG = lag;

  // Instantiate content array 
  const content_meta: ArticleGroup[] = [];

  // Iterate through each category
  for (const article_group of lag.content) {
    // Instantiate <ArticleGroup> object
    const article_group_meta: ArticleGroup = {
      category: article_group.category,
      articles: [],
    };

    // Optional debug logging
    if (debug) console.log(`    ${article_group.category}`);

    // Iterate through each article within category
    for (const article of article_group.articles) {
      // Optional debug logging
      if (debug) console.log(`     ﬌ ${article.url}`);

      // Instantiate <LinkPreview> object
      let link_preview: LinkPreview = {
        url: article.url,
        title: "",
        description: "",
        image: "",
        source: "",
        error: "",
      };

      // Instantiate <Article> object
      let article_meta: Article = {
        ...article
      };

      try {
        // Fetch metadata
        link_preview = await unfurl_js(article.url);
        
        // Assign link-preview properties to article object
        article_meta = {
          ...article,  // Append existing properties (url and caption)
          title: link_preview.title,
          description: link_preview.description,
          image: link_preview.image,
          source: link_preview.source,
        };
      } catch (error) {
        if (debug) console.log(`        ${error}`);
      }

      // Append to articles array
      article_group_meta.articles.push(article_meta);
    }

    // Append to content array
    content_meta.push(article_group_meta);
  }

  // Assign content array to content property
  lag_meta.content = content_meta;

  return lag_meta;
}

// Check if given string contains keyphrases
export function isCategory(line: string): boolean {
  // Check if a category has been found
  let category_found = true;
  for (const category of CATEGORIES) {
    category_found = true; // initialize value to be true
    
    // Split category into keywords
    const keywords: string[] = category
      .split(" ")
      .filter(word => word.length > 0)
      .map(word => word.toLowerCase());

    // Check if each category keyword is present in line
    for (const keyword of keywords) {
      if (!line.toLowerCase().includes(keyword)) category_found = false;
    }

    // Exit loop if category has been found
    if (category_found) break;
  }

  // If category found, check if line is exact match to official category
  if (category_found && !CATEGORIES.includes(line)) {
    throw Error(`Potential typo on line: ${line}`);
  }
  
  return category_found;
}

