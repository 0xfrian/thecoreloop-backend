import previewLink from "../modules/link-preview";

async function main() {
  const url: string = "https://www.gamesindustry.biz/marvel-snap-amasses-30m-in-global-consumer-spending";
  console.log(`Generating link preview: ${url} . . . `);
  const link_preview: any = await previewLink(url);

  console.log("Link Preview: ");
  console.log(link_preview);
}

main()
  .then(() => process.exit(0));

