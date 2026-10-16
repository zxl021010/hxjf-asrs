const LOCATION_CODE_PAD_LENGTH = 3;

/**
 * Normalize a location code: pad pure-numeric codes to a fixed length.
 * Non-numeric codes are returned as-is (trimmed).
 */
export const normalizeCode = (code: string): string => {
  const trimmed = code.trim();
  if (/^\d+$/.test(trimmed)) {
    return trimmed.padStart(LOCATION_CODE_PAD_LENGTH, '0');
  }
  return trimmed;
};
