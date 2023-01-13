// Node Modules
import { unfurl } from "unfurl.js";

// Local Modules
import { unfurl_js } from "../modules/link-preview";

// Types
import { LinkPreview } from "../types";

async function main() {
  const url: string = "https://www.konvoy.vc/reports-pdf/gaming-industry-report?xYanOv=sY8xePfojkwYRZLD3lhBH&slOger=subscribed";

  console.log(`Generating link preview: ${url} . . . \n`);

  try {
    const link_preview: any = await unfurl_js(url);

    console.log("Link Preview: ");
    console.log(link_preview);
  } catch (error) {
    console.log(error);
  }
}

main()
  .then(() => process.exit(0));

