/**
 * Displays Arduino/C++ code snippets in a styled code block.
 * 
 * Renders code in a dark themed container with syntax preservation.
 * Returns null if no code is provided.
 * 
 * @param props - Component props
 * @param props.code - The code string to display
 */
export default function CodeSnippet({ code }: { code: string }) {
    if (!code) return null;

    return (
        <div className="relative mt-4 rounded-lg bg-slate-900 p-4 font-mono text-xs text-white sm:text-sm overflow-x-auto shadow-inner border border-slate-700">
            <div className="absolute top-2 right-2 text-[10px] text-slate-500 uppercase tracking-wider font-bold">Arduino / C++</div>
            <pre className="mt-2">
                <code>{code}</code>
            </pre>
        </div>
    );
}
