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
