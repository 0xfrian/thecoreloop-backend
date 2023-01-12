// Local Modules
import { Date } from "./date";
import { unfurl_js } from "../modules/link-preview";

// Types
import { 
  StringMap, 
  TelegramMessage, 
  LAG, 
  ArticleGroup, 
  Article, 
  LinkPreview 
} from "../types";

// Constants
export const CATEGORIES: StringMap = {
  "SPECIAL INSIGHTS": "‼️ SPECIAL INSIGHTS 👀",
  "SPOTLIGHT": "🔦 Spotlight 🌟",
  "MARKET": "🌊 MARKET ☎️",
  "DEEP DIVES": "💎 Deep Dives 🔎",
  "PLATFORMS": "🌈 Platforms 🏔",
  "WEB3 + META": "✨ Web 3️⃣ + Meta 🌎",
  "KNOWLEDGE HUB": "🧠 Knowledge Hub 📚",
  "FUNDRAISING": "💰 Fundraising 🧧",
  "GAME & STATS RELEASES": "👾 Game & Stats Releases 🎮",
};
export const LAG_EXCEPTIONS: number[] = [1, 2, 3, 56, 57, 58, 59, 60, 62];
export const BLACKLIST_ARTICLES: string[] = [
  "https://www.deconstructoroffun.com/newsletter/bdtxbgs", // LAG #6
  "https://www.deconstructoroffun.com/newsletter/wthigo",  // LAG #7
  "https://www.data.ai/en/go/the-state-of-anime-gaming-2022/", // LAG #26
  "https://twitter.com/andy8052/status/1557433547606089728?s=28&t=JmDdB-7dX5cQbUZuTYeIUA", // LAG #29
  "https://naavik.co/pro-blockchain-games/mastering-liquidity-pools", // LAG #32
  "https://www.pocketgamer.biz/news/80008/newzoos-latest-report-offers-sterling-insight-into-cloud-gaming/", // LAG #82
];

export function parseLAG(message: TelegramMessage): LAG {
  const lag: LAG = {
    heading: "",
    subheading: "",
    message_id: message.id,
    number: -1,
    date: "",
    content: [],
  };

  // Split text content line-by-line
  const lines: string[] = message.text
    .split("\n")
    .filter(line => line.length > 1)
    .map(line => line.trim());

  // Assign heading (assume 1st line)
  const heading: string = lines[0];

  // Parse LAG number and assign corresponding property
  const hashtag_index: number = heading.indexOf("#");
  if (hashtag_index >= 0) {
    const ending_index: number = heading.indexOf(" ", hashtag_index);
    lag.number = Number(heading.slice(hashtag_index+1, ending_index));
  } else throw Error("LAG number not found!");

  // Assing heading property 
  lag.heading = `Look at Gaming #${lag.number}`;

  // Parse date and assign corresponding property
  try {
    const date: Date = new Date(heading);
    lag.date = date.toString();
  } catch (error) {
    throw Error(`LAG #${lag.number}: date not found!`);
  }

  // Parse category indices
  let categories_found: string[] = [];
  let category_indices: number[] = [];
  for (let i = 1; i < lines.length; i++) {
    try {
      if (isCategory(lines[i])) {
        category_indices.push(i);
        categories_found.push(lines[i]);
      }
    } catch (error) {
      throw Error(`Something went wrong while checking category: ${error}`);
    }
  }
  if (category_indices.length == 0) throw Error(`LAG #${lag.number}: No LAG categories found`);

  // If the 2nd line is NOT a category, then assume subheading until 1st category index
  if (category_indices[0] != 1) lag.subheading = lines.slice(1, category_indices[0]).join("\n") + "\n";

  // Organize content within LAG post
  let content: ArticleGroup[] = [];  // Initialize content array
  let has_spotlight: boolean = false;
  for (let j = 0; j < category_indices.length; j++) {
    // Assign current category index and category
    const current_index: number = category_indices[j]
    const category: string = lines[current_index];

    // Instantiate <ArticleGroup> object
    let article_group: ArticleGroup = {
      category: category,
      articles: [],
    };

    // Assign index representing end of category
    const next_index: number = (j < category_indices.length-1) 
      ? category_indices[j+1]
      : lines.length;

    // Handle SPECIAL INSIGHTS category 
    if (category == CATEGORIES["SPECIAL INSIGHTS"]) {
      // Assign caption
      const caption: string = parseTextByCategory(message.text, CATEGORIES["SPECIAL INSIGHTS"]);

      // Instantiate <Entry> object
      const article: Article = {
        caption: caption,
        url: "",
      };
      article_group.articles.push(article);
    } else {
      if (category.toLowerCase().includes("spotlight")) has_spotlight = true;

      // Check if there is an even number of lines between categories
      if (Math.abs(current_index+1 - next_index) % 2 != 0) {
        throw Error(`LAG #${lag.number}: Uneven number of captions & URLs under category: ${category}`);
      }

      // Iterate pair-wise through captions & URLs until next category index
      for (let k = current_index+1; k < next_index-1; k+=2) {
        // Skip if line marks end of LAG post
        if (lines[k].includes("—————")) continue;

        // Assign caption & URL
        const caption: string = lines[k];
        const url: string = lines[k+1];

        if (!isURL(url)) throw Error(`Invalid URL: ${url} under category: ${category}`);

        // Instantiate <Entry> object
        const article: Article = {
          caption: caption,
          url: url,
        };
        article_group.articles.push(article);
      }
    }

    // Append ArticleGroup to content array
    content.push(article_group);
  }

  // Throw error if no Spotlight section detected
  if (!has_spotlight) throw Error("No Spotlight category");

  // Assign content property
  lag.content = content;

  return lag;
}

// Check if given string contains keyphrases
export function isCategory(line: string): boolean {
  // Check if a category has been found
  let category_found = true;
  const official_categories = Object.values(CATEGORIES);
  for (const category of official_categories) {
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
  if (category_found && !official_categories.includes(line)) throw Error(`Potential typo on line: ${line}`);
  
  return category_found;
}

// Check if given string contains a URL
export function isURL(line: string): boolean {
  return Boolean(new URL(line));
}

// Formats string to display LAG post with spacing convention 
export function formatString(lag: LAG, ordered: boolean = false): string {
  // Initialize content array
  let content: ArticleGroup[] = [];
  if (ordered) {
    let official_categories: string[] = Object.values(CATEGORIES);
    for (const official_category of official_categories) {
      for (const article_group of lag.content) {
        if (article_group.category == official_category) content.push(article_group);
      }
    }
  } else content = lag.content;

  // Initialize string
  let output: string = "";

  // Append heading line
  const heading: string = `Look at Gaming #${lag.number} | ${lag.date}` + "\n";
  if(lag.subheading.length > 0) output += heading + "\n\n" + lag.subheading + "\n\n";
  else output += heading + "\n\n";

  // Iterate through categories
  for (let i = 0; i < content.length; i++) {
    // Assign ArticleGroup
    const article_group: ArticleGroup = content[i];

    // Append category line
    output += article_group.category + "\n";

    // Append captions & URLs
    if (article_group.category == CATEGORIES["SPECIAL INSIGHTS"]) {
      // For SPECIAL INSIGHTS category, append only caption
      output += article_group.articles[0].caption + "\n";
    } else {
      // For every other category, append caption + URL
      for (let j = 0; j < article_group.articles.length; j++) {
        // Append entry
        const article: Article = article_group.articles[j];
        output += article.caption + "\n"; 
        output += article.url + "\n";

        // If not last entry, then add empty line after entry
        if (j < article_group.articles.length-1) output += "\n"
      }

      // Append 2 empty lines between categories
      if (i < content.length-1) output += "\n\n";
    }
  }

  return output;
}

function parseTextByCategory(raw_text: string, line_start: string): string {
  // Split raw text line-by-line and remove surrounding whitespaces
  const lines: string[] = raw_text.split("\n").map(line => line.trim());

  // Collect line indices containing categories
  const category_indices: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line: string = lines[i];
    if (isCategory(line)) category_indices.push(i);
  }

  let special_insights_section: string = "";
  for (let i = 0; i < category_indices.length-1; i++) {
    const current_index: number = category_indices[i];
    const next_index: number = category_indices[i+1];
    const category: string = lines[current_index];

    if (category == line_start) {
      special_insights_section = lines.slice(current_index+1, next_index).join("\n");
      break;
    }
  }

  return special_insights_section;
}

export async function attachMetadata(lag: LAG, debug: boolean=false): Promise<LAG> {
  // Instantiate new <LAG> object to be filled with metadata
  const lag_meta: LAG = lag;

  // Instantiate content array 
  const content_meta: ArticleGroup[] = [];

  // Iterate through each category
  for (const article_group of lag.content) {
    // Skip SPECIAL INSIGHTS category section
    if (article_group.category.toLowerCase().includes("special insights")) continue;

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
      if (debug) console.log(`    ﬌ ${article.url}`);

      // Instantiate <LinkPreview> object
      let link_preview: LinkPreview = {
        url: article.url,
        title: "",
        description: "",
        image: "",
        source: "",
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

