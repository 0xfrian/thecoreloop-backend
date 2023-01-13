// Node Modules
import fs from "fs";
import path from "path";

// Types
import { ArticleGroup, LAG } from "../types";

export default async function main() {
  const dir: string = path.join(__dirname, "../../LAG/meta/");
  const filenames: string[] = fs.readdirSync(dir);

  const archive_report: any = [];
  console.log("Checking LAG Archive . . . ");
  for (const filename of filenames) {
    const file: string = path.join(__dirname, "../../LAG/meta/", filename);
    const lag: LAG = JSON.parse(fs.readFileSync(file, { encoding: "utf-8" }));
    const lag_report: any = {
      lag_number: lag.number,
      date: lag.date,
      missing_content: [],
    };
    
    for (const article_group of lag.content) {
      // Skip special insights section
      if (article_group.category.includes("SPECIAL INSIGHTS")) continue;

      // Instantiate new object to store missing articles
      const article_group_missing: any = {
        category: article_group.category,
        articles: [],
      };

      for (const article of article_group.articles) {
        const keys: string[] = Object.keys(article);
        const missing_props: string[] = [];
        for (const key of keys) {
          const value: string = article[key] || "";
          if (value.length > 0) continue;
          else missing_props.push(key);
        }
        if (missing_props.length > 0) {
          article_group_missing.articles.push({
            url: article.url, 
            missing: missing_props,
          });
        }
      }
      if (article_group_missing.articles.length > 0) lag_report.missing_content.push(article_group_missing);
    }
    archive_report.push(lag_report);
  }

  console.log("nWriting Archive Report . . . ");
  fs.writeFileSync(
    path.join(__dirname, "../../LAG/", "archive-report.json"),
    JSON.stringify(archive_report, null, 2),
  );

  console.log("\nSummary: ");
  for (const lag_report of archive_report) {
    console.log(`  LAG #${lag_report.lag_number}: `);
    for (const article_group_missing of lag_report.missing_content) {
      for (const article of article_group_missing.articles) {
        console.log(`    ${article_group_missing.category}: ${article.url}`);
      }
    }
  }
}

