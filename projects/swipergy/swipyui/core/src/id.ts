let instanceCounter = 0;

/**
 * Generate a document-unique id for wiring labels and ARIA attributes.
 */
export function uniqueId(prefix = 'sy'): string {
  return `${prefix}-${++instanceCounter}`;
}
