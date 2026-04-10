/**
 * Minimal markdown-like parser for comment bodies.
 *
 * Supports fenced code blocks and a small set of inline formatting options:
 * - links [text](url)
 * - bold **text**
 * - underline __text__
 * - italic *text*
 *
 * Also handles HTML content from Tiptap editor with proper sanitization.
 */
import CodeBlock from "@/components/comments/CodeBlock";
import { Fragment, ReactNode } from "react";
import parse from "html-react-parser";
import { sanitizeHtml } from "@/lib/sanitize";

export const parseCommentContent = (content: string) => {
    // Check if content looks like HTML (from Tiptap)
    if (content.includes('<') && content.includes('>')) {
        // Sanitize the HTML to prevent XSS
        const sanitized = sanitizeHtml(content);
        // Parse and render the sanitized HTML
        return (
            <div className="text-slate-700 leading-relaxed prose prose-sm max-w-none [&_p]:m-0 [&_ul]:my-2 [&_ol]:my-2 [&_li]:my-1 [&_strong]:font-bold [&_em]:italic [&_u]:underline [&_a]:text-blue-600 [&_a]:hover:underline [&_code]:bg-slate-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_pre]:bg-slate-800 [&_pre]:text-slate-100 [&_pre]:p-3 [&_pre]:rounded [&_pre]:overflow-x-auto">
                {parse(sanitized)}
            </div>
        );
    }

    // Otherwise, parse as markdown
    // Regex for code blocks: ```code```
    const parts = content.split(/```([\s\S]*?)```/g);

    return parts.map((part, index) => {
        if (index % 2 === 1) {
            // This is a code block
            return <CodeBlock key={index} code={part.trim()} />;
        }

        // Parse standard markdown
        // We'll do a simple split and map for Bold, Italic, Underline, Link
        // Order matters! 

        // 1. Links [text](url)
        // 2. Bold **text**
        // 3. Underline __text__
        // 4. Italic *text*

        return (
            <div key={index} className="whitespace-pre-wrap wrap-break-word">
                {parseMarkdown(part)}
            </div>
        );
    });
};

const parseMarkdown = (text: string) => {
    // This is a very basic parser. For robust prod use, use a library like react-markdown.
    // However, to satisfy the specific "Underline" and "Bold" requests simply:

    // Split by Link pattern [text](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const linkParts = text.split(linkRegex);

    // If no links, process rest
    if (linkParts.length === 1) return parseStyles(text);

    // If matches, we have [pre, label, url, post, label, url, post...]
    // The split on groups includes the groups.
    // So 0: pre, 1: label, 2: url, 3: post...

    const elements = [];
    for (let i = 0; i < linkParts.length; i += 3) {
        elements.push(<Fragment key={`t-${i}`}>{parseStyles(linkParts[i])}</Fragment>);
        if (i + 2 < linkParts.length) {
            const label = linkParts[i + 1];
            const url = linkParts[i + 2];
            elements.push(
                <a
                    key={`l-${i}`}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                >
                    {label}
                </a>
            );
        }
    }
    return elements;
};



const parseStyles = (text: string): (string | ReactNode)[] | string => {
    // Recursively parse styles? Or just regex chaining?
    // Let's do a simple component-based replace approach requires rigorous structure so styles don't conflict easily.
    // Strategy: Split by largest priority token, then recurse.

    // Priority: Bold (**), Underline (__), Italic (*)

    // BOLD
    const boldParts = text.split(/\*\*(.*?)\*\*/g);
    if (boldParts.length > 1) {
        return boldParts.map((part, i) => i % 2 === 1
            ? <strong key={`b-${i}`} className="font-bold">{parseStyles(part)}</strong>
            : parseStyles(part) // Recurse for nested
        );
    }

    // UNDERLINE
    const underlineParts = text.split(/__(.*?)__/g);
    if (underlineParts.length > 1) {
        return underlineParts.map((part, i) => i % 2 === 1
            ? <u key={`u-${i}`}>{parseStyles(part)}</u>
            : parseStyles(part)
        );
    }

    // ITALIC
    const italicParts = text.split(/\*(.*?)\*/g);
    if (italicParts.length > 1) {
        return italicParts.map((part, i) => i % 2 === 1
            ? <em key={`i-${i}`} className="italic">{parseStyles(part)}</em>
            : parseStyles(part)
        );
    }

    return text;
};
