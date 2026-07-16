export const escapeCsvCell = (value: string | number | null): string => {
  let text = value === null ? '' : String(value);
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
};
