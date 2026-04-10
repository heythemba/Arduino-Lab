/**
 * Lightweight HTML sanitizer that works in both server and client environments.
 * Replaces isomorphic-dompurify to avoid jsdom ESM/CJS conflicts in production.
 *
 * Strips all tags/attributes except an explicit allowlist used for rich-text step content.
 */

const ALLOWED_TAGS = new Set(['b', 'i', 'em', 'strong', 'u', 'a', 'p', 'br', 'ul', 'ol', 'li', 'code', 'pre']);
const ALLOWED_ATTRS: Record<string, string[]> = {
    a: ['href', 'target', 'rel'],
};

export function sanitizeHtml(html: string): string {
    if (!html) return '';

    // Replace &nbsp; with a regular space
    let result = html.replace(/&nbsp;/g, ' ');

    // Remove all tags except those in the allowlist, stripping disallowed attributes
    result = result.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g, (match, tag: string, attrs: string) => {
        const lowerTag = tag.toLowerCase();

        if (!ALLOWED_TAGS.has(lowerTag)) {
            // Strip the tag entirely
            return '';
        }

        // For closing tags, let them through as-is
        if (match.startsWith('</')) {
            return `</${lowerTag}>`;
        }

        // Filter attributes
        const allowedAttrNames = ALLOWED_ATTRS[lowerTag] || [];
        let safeAttrs = '';

        if (allowedAttrNames.length > 0) {
            const attrRegex = /([a-zA-Z-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+))/g;
            let attrMatch;
            while ((attrMatch = attrRegex.exec(attrs)) !== null) {
                const attrName = attrMatch[1].toLowerCase();
                const attrValue = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4];
                if (allowedAttrNames.includes(attrName)) {
                    // Block javascript: URLs in href
                    if (attrName === 'href' && /^javascript:/i.test(attrValue.trim())) continue;
                    safeAttrs += ` ${attrName}="${attrValue}"`;
                }
            }
        }

        // Self-closing check
        const selfClose = match.endsWith('/>') ? ' /' : '';
        return `<${lowerTag}${safeAttrs}${selfClose}>`;
    });

    return result;
}
