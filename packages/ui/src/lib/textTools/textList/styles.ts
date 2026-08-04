export const listStyles = ["bullet"] as const;
export type ListStyle = (typeof listStyles)[number];
