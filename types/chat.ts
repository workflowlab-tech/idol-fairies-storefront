export type ChatRole = "user" | "assistant";

export type ChatHistoryMessage = {
  role: ChatRole;
  text: string;
};

export type ChatProductSummary = {
  slug: string;
  artist: string;
  productName: string;
  pricePHP: number;
  stockStatus: string;
};

export type ChatReply = {
  text: string;
  products?: ChatProductSummary[];
};

export const MAX_MESSAGE_LENGTH = 800;
export const MAX_HISTORY_MESSAGES = 8;
