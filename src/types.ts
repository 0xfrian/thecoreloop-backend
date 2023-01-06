// Look At Gaming 
export interface StringMap {
  [key: string]: string;
}

export interface LAG {
  heading: string;
  subheading: string;
  message_id: number;     // TODO: change to string
  number: number;         // TODO: change to string
  date: string;
  content: ArticleGroup[];
}

export interface ArticleGroup {
  category: string; 
  articles: Article[];
}

export interface Article {
  [index: string]: string | undefined;
  caption: string; 
  url: string;
  title?: string; 
  description?: string;
  image?: string;
  source?: string;
}


// Link-Preview 
export interface LinkPreview {
  url: string | URL; 
  title: string; 
  description: string;
  image: string;
  source: string;
}


// Telegram
export interface TelegramMessage {
  text: string, 
  id: number,
}

