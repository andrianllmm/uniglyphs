export const listStyles = ["bullet", "numbered", "checklist"] as const;
export type ListStyle = (typeof listStyles)[number];
