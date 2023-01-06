// Node Modules
import { getLinkPreview } from "link-preview-js";

// Types
import { LinkPreview } from "../types";

export default async function previewLink(url: string): Promise<any> {
  const options: any = {
    headers: { 
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'en-US,en;q=0.9,fr;q=0.8,ro;q=0.7,ru;q=0.6,la;q=0.5,pt;q=0.4,de;q=0.3',
      'cache-control': 'max-age=0',
      'upgrade-insecure-requests': '1',
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36'
    },
    followRedirects: `manual`,
    handleRedirects: (baseURL: string, forwardedURL: string) => {
      const urlObj = new URL(baseURL);
      const forwardedURLObj = new URL(forwardedURL);
      if (forwardedURLObj.hostname === urlObj.hostname 
        || forwardedURLObj.hostname === "www." + urlObj.hostname 
        || "www." + forwardedURLObj.hostname === urlObj.hostname
      ) return true;
      else return false;
    },
    timeout: 5000
  };

  let link_preview: LinkPreview = {
    url: url,
    title: "",
    description: "",
    image: "",
    source: "",
  };

  for (let i = 0; i < 3; i++) {
    try {
      const { title, description, images, siteName }: any = await getLinkPreview(url, options);

      if (title) link_preview.title = title;
      if (description) link_preview.description = description;

      if (siteName) link_preview.source = siteName;
      else link_preview.source = new URL(url).hostname;

      if (images && images.length > 0) link_preview.image = images[0];
      else if (url.slice(-3).includes("pdf")) link_preview.image = "https://upload.wikimedia.org/wikipedia/commons/3/38/Icon_pdf_file.svg";

      break;
    } catch (error) {
      console.log(`Error occured while previewing link: ${url}`);
      console.log(error);
    }
  }
  return link_preview;
}

