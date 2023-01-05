// Node Modules
import { getLinkPreview } from "link-preview-js";

// Types
import { LinkPreview } from "../types";

export default async function previewLink(url: string): Promise<any> {
  const options: any = {
    imagesPropertyType: "og",
    headers: {
      "user-agent": "googlebot",
    },
    followRedirects: `manual`,
    handleRedirects: (baseURL: string, forwardedURL: string) => {
      const urlObj = new URL(baseURL);
      const forwardedURLObj = new URL(forwardedURL);
      if (forwardedURLObj.hostname === urlObj.hostname 
        || forwardedURLObj.hostname === "www." + urlObj.hostname 
        || "www." + forwardedURLObj.hostname === urlObj.hostname
      ) {
        return true;
      } else return false;
    },
    timeout: 5000
  };

  const link_preview: any = await getLinkPreview(url, options);

  const link_preview_parsed: LinkPreview = {
    url: link_preview.url || "",
    title: link_preview.title || "",
    description: link_preview.description || "",
    image: link_preview.images[0] || "",
    source: link_preview.siteName || "",
  };

  return link_preview_parsed;
}

