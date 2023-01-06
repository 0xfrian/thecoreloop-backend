// Node Modules
import { unfurl } from 'unfurl.js'

// Local Modules
import previewLink from "../modules/link-preview";

async function main() {
  const url: string = "https://streamhatchet.com/blog/nike-is-the-most-prominent-apparel-brand-among-twitch-streamers/";

  const result: any = await unfurl(url);

  console.log("Result: ");
  console.log(result);
  console.log();

  console.log("Parsed Result: ");
  console.log(result.title);
  console.log();

  console.log(`Generating link preview: ${url} . . . `);
  const link_preview: any = await previewLink(url);
  console.log("Link Preview: ");
  console.log(link_preview);
}

main()
  .then(() => process.exit(0));

