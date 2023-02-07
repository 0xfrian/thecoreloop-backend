// Node Modules
import { unfurl } from "unfurl.js";

// Local Modules
import { unfurl_js } from "../modules/link-preview";

// Types
import { LinkPreview } from "../types";

async function main() {
  const url: string = "https://twitter.com/degenscore/status/1622214608940310530?s=46&t=gM-RgdMXxH1aP6NhFFNHVg";
  // const url: string = "https://t.co/2GhWnq3tdB";

  console.log(`Generating link preview: ${url} . . . \n`);

  try {
    // const link_preview: any = await unfurl(url);
    const link_preview: LinkPreview = await unfurl_js(url);

    console.log("Link Preview: ");
    console.log(link_preview);
  } catch (error) {
    console.log(error);
  }
}

main()
  .then(() => process.exit(0));

