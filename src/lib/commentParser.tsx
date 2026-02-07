import CodeBlock from "@/components/comments/CodeBlock";
import { Fragment, ReactNode } from "react";

export const parseCommentContent = (content: string) => {
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
            <div key={index} className="whitespace-pre-wrap break-words">
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
