// Node Modules
import { unfurl } from "unfurl.js";

// Local Modules
import { unfurl_js } from "../modules/link-preview";

// Types
import { LinkPreview } from "../types";

async function main() {
  const url: string = "https://naavik.co/pro-blockchain-games/mastering-liquidity-pools";

  console.log(`Generating link preview: ${url} . . . \n`);

  try {
    // const link_preview: any = await unfurl(url);
    const link_preview: any = await unfurl_js(url);

    console.log("Link Preview: ");
    console.log(link_preview);
  } catch (error) {
    console.log(error);
  }
}

main()
  .then(() => process.exit(0));

