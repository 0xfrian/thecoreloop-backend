// Node Modules
const extractUrls = require("extract-urls");

// Local Modules
import { unfurl_js } from "../modules/link-preview";

// Types
import { LinkPreview } from "../types";

async function main() {
  const url: string = "https://twitter.com/accel_capital/status/1597984106318823425";

  console.log(`Generating link preview: ${url} . . . \n`);
  const link_preview: LinkPreview = await unfurl_js(url);

  console.log("Link Preview: ");
  console.log(link_preview);
  console.log();
}

main()
  .then(() => process.exit(0));

