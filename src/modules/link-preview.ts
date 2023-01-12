// Node Modules
import axios from "axios";
import { unfurl } from 'unfurl.js'
const extractUrls = require("extract-urls");
import { getLinkPreview } from "link-preview-js";

// Types
import { LinkPreview } from "../types";

// Helper function
function replaceAll(s: string, search: string, replace: string) {
  return s.split(search).join(replace);
}

export async function link_preview_js(url: string): Promise<LinkPreview> {
  // Additional options for link preview
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

  // Instantiate <LinkPreview> object
  let link_preview: LinkPreview = {
    url: url,
    title: "",
    description: "",
    image: "",
    source: "",
  };

  // Attempt calling getLinkPreview() three times
  for (let i = 0; i < 3; i++) {
    try {
      // Destructure link preview properties
      const { title, description, images, siteName }: any = await getLinkPreview(url, options);

      if (title) link_preview.title = title;
      if (description) link_preview.description = description;
      if (siteName) link_preview.source = siteName;
      else link_preview.source = new URL(url).hostname;
      if (images && images.length > 0) link_preview.image = images[0];
      else if (url.slice(-3).includes("pdf")) link_preview.image = "https://upload.wikimedia.org/wikipedia/commons/3/38/Icon_pdf_file.svg";

      break;  // if reached this point then no need to re-attempt getLinkPreview()
    } catch (error) {
      console.log(`Error while previewing link: ${url}`);
      console.log(error);
    }
  }

  return link_preview;
}

export async function unfurl_js(url: string): Promise<LinkPreview> {
  // Initialize <LinkPreview> object
  let link_preview: LinkPreview = {
    url: url,
    title: "",
    description: "",
    image: "",
    source: "",
  };

  // Additional options for link preview
  const options: any = {
    headers: { 
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'en-US,en;q=0.9,fr;q=0.8,ro;q=0.7,ru;q=0.6,la;q=0.5,pt;q=0.4,de;q=0.3',
      'cache-control': 'max-age=0',
      'upgrade-insecure-requests': '1',
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36'
    },
    timeout: 5000,
  };

  // Generate link preview . . . 
  try {
    if (url.includes("https://twitter.com/")) {
      // If URL is a Tweet, then . . . 
      
      const { open_graph }: any = await unfurl(url);

      // Assign title
      if (open_graph.title) link_preview.title = open_graph.title;

      // Assign description
      if (open_graph.description) link_preview.description = open_graph.description;

      // Assign image (default: Twitter Logo)
      link_preview.image = "https://assets.stickpng.com/images/580b57fcd9996e24bc43c53e.png";
      if (open_graph.images && open_graph.images.length > 0) link_preview.image = open_graph.images[0];
      // If image not found, then generate thumbnail from first link in description (if any)
      if (!link_preview.image && link_preview.description) {
        const urls: string[] = extractUrls(link_preview.description);
        if (urls && urls.length > 0) {
          // Generate thumbnail using the first link found
          const thumbnail: string = (await unfurl_js(urls[0])).image;
          if (thumbnail) link_preview.image = thumbnail;
        }
      }

      // Assign source (default: "Twitter")
      const author: string = url.substring(20, url.indexOf("/", 20));
      if (author) link_preview.source = author;
      else if (!link_preview.source) link_preview.source = "Twitter";
    } else {
      // Else if URL is a regular article, then . . . 
      
      const { author, title, description, open_graph, oEmbed }: any = await unfurl(url, options);

      // Assign title
      if (title) link_preview.title = title;

      // Assign description
      if (description) link_preview.description = description; 

      // Use OpenGraph for description, image, and source
      if (open_graph) {   
        if (!link_preview.description) link_preview.description = open_graph.description;
        if (open_graph.images && open_graph.images.length > 0) link_preview.image = open_graph.images[0].url;
        if (open_graph.site_name) link_preview.source = open_graph.site_name;
      }

      // Use oEmbed for image and source (if needed)
      if (oEmbed) {
        if (!link_preview.image) {
          if (oEmbed.thumbnails && oEmbed.thumbnails.length > 0) link_preview.image = oEmbed.thumbnails[0].url;
        } 
        if (!link_preview.source) {
          if (oEmbed.provider_name) link_preview.source = oEmbed.provider_name;
        }
      }

      // Assign source (default: URL domain name)
      if (!link_preview.source && author) link_preview.source = author;
      else if (!link_preview.source) link_preview.source = (new URL(url)).hostname;
    }
  } catch (error: any) {
    throw `${error.message} while previewing ${url}`;
  }

  return link_preview;
}

export async function embedTweet(tweet: string): Promise<any> {
  const endpoint: string = `https://publish.twitter.com/oembed?url=${tweet}`;
  const options: any = {
    data: {
      dnt: "false",
      theme: "dark",
      omit_script: "true",
      hide_thread: "true",
    },
  };

  // Send GET request to Twitter oEmbed API endpoint
  const response: any = await axios.get(endpoint, options);

  // Parse HTML snippet from response
  const html_snippet: string = replaceAll(response.data.html.replace("class", "className"), "<br>", "<br />");

  return html_snippet;
}

