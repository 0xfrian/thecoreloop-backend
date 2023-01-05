// Look At Gaming 
export interface StringMap {
  [key: string]: string;
};

export interface Article {
  caption: string; 
  url: string;
};

export interface ArticleGroup {
  category: string; 
  articles: Article[];
};

export interface Card {
  caption: string;
  url: string; 
  title: string; 
  description: string;
  image: string;
  source: string;
};

export interface CardGroup {
  category: string; 
  cards: Card[];
};


// Link-Preview 
export interface LinkPreview {
  url: string; 
  title: string; 
  description: string;
  image: string;
  source: string;
};


// Telegram
export interface TelegramMessage {
  text: string, 
  id: number,
};

