export type ChatRole = "user" | "assistant";

export type ChatHistoryMessage = {
  role: ChatRole;
  text: string;
};

export type ChatReply = {
  text: string;
  productSlugs?: string[];
};

export const MAX_MESSAGE_LENGTH = 800;
export const MAX_HISTORY_MESSAGES = 8;
