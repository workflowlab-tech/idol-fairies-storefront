export type FaqItem = { id: string; question: string; answer: string };

export type FaqGroup = { id: string; title: string; items: FaqItem[] };
