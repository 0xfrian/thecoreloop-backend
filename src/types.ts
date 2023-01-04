// Look At Gaming 
export interface StringMap {
  [key: string]: string;
}

export interface Article {
  caption: string; 
  url: string;
};

export interface ArticleGroup {
  category: string; 
  articles: Article[];
};

// Telegram
export interface TelegramMessage {
  text: string, 
  id: number,
}

