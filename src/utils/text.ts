/**
 * Sanitizes code blocks to ensure they are properly formatted
 * @param text The text containing code blocks to sanitize
 * @returns Sanitized text with properly formatted code blocks
 */
export function sanitizeCodeBlocks(text: string): string {
  const lines = text.split('\n');
  let inCodeBlock = false;
  let inConsoleLog = false;
  let inStringLiteral = false;
  let stringLiteralChar = '';
  
  return lines.map(line => {
    // Handle code block markers
    if (line.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      return line;
    }
    
    if (inCodeBlock) {
      // Reset string literal tracking at the start of each line
      inStringLiteral = false;
      stringLiteralChar = '';
      inConsoleLog = line.includes('console.log') || line.includes('console.error');
      
      // Process the line character by character
      let result = '';
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];
        const prevChar = line[i - 1];
        
        // Handle string literals
        if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
          if (!inStringLiteral) {
            inStringLiteral = true;
            stringLiteralChar = char;
          } else if (char === stringLiteralChar) {
            inStringLiteral = false;
          }
        }
        
        // Handle template literals and string concatenation
        if (char === '$' && nextChar === '{' && (inStringLiteral || inConsoleLog)) {
          result += '\\$';  // Escape the dollar sign
        } else if (char === '+' && !inStringLiteral && line.includes('${')) {
          // Convert string concatenation to template literal
          const beforePlus = result.trimEnd();
          const afterPlus = line.substring(i + 1).trimStart();
          if (!beforePlus.endsWith('`') && !afterPlus.startsWith('`')) {
            result = '`' + beforePlus.replace(/['"]$/, '') + '${';
            i += afterPlus.indexOf('{') + 1;
            continue;
          }
        } else {
          result += char;
        }
      }
      
      // Fix malformed template literals in console statements
      if (inConsoleLog && !result.includes('`') && result.includes('${')) {
        result = result.replace(/(['"])(.*?)\$\{(.*?)\}\1/g, '`$2${$3}`');
      }
      
      return result;
    }
    
    return line;
  }).join('\n');
}

/**
 * Sanitizes text content to ensure valid UTF-8 encoding
 * @param text The text to sanitize
 * @returns Sanitized text
 */
export function sanitizeText(text: string | undefined): string {
  if (!text) return '';
  
  try {
    // First attempt to normalize the string to handle composite characters
    const normalized = text.normalize('NFKC');
    
    // Convert to buffer and back to validate UTF-8 and handle encoding issues
    const buffer = Buffer.from(normalized, 'utf8');
    let validUtf8 = buffer.toString('utf8');
    
    // Handle special characters and symbols while preserving common ones
    validUtf8 = validUtf8
      .replace(/[\uFFFD\uFFFE\uFFFF]/g, '') // Remove replacement char and invalid Unicode
      .replace(/[\u200B-\u200F\u2028-\u202F]/g, ''); // Remove zero-width and directional formatting chars
    
    // If the text contains code blocks, handle them separately
    if (validUtf8.includes('```') || validUtf8.includes('`')) {
      return sanitizeCodeBlocks(validUtf8);
    }
    
    return validUtf8;
  } catch (error) {
    console.error('Error sanitizing text:', error);
    // If text is completely invalid, return empty string
    return '';
  }
}
