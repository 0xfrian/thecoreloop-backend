// Look At Gaming 
export interface LAG {
  heading: string;
  subheading: string;
  message_id: number;
  number: number;
  date: string;
  special_insights: string;
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
  [index: string]: string;
  url: string; 
  title: string; 
  description: string;
  image: string;
  source: string;
  error: any;
}


// Telegram
export interface TelegramMessage {
  text: string, 
  id: number,
}

