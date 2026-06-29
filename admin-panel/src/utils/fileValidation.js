export const ACCEPTED_UPLOAD_EXT = ['.xlsx', '.csv'];

export const isValidSpreadsheetFile = (file) => {
  if (!file) return false;
  const name = file.name.toLowerCase();
  return ACCEPTED_UPLOAD_EXT.some((ext) => name.endsWith(ext));
};
