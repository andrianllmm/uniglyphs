export const listStyles = ["bullet", "numbered"] as const;
export type ListStyle = (typeof listStyles)[number];
