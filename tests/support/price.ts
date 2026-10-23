/** Parse the pinned English app's USD labels into integer cents. Reject malformed UI values. */
export function parsePrice(text: string): number {
  const match = /^\$(\d+)\.(\d{2})$/.exec(text.trim());
  if (!match)
    throw new Error(`Invalid USD price label: ${JSON.stringify(text)}`);
  return Number(match[1]) * 100 + Number(match[2]);
}
