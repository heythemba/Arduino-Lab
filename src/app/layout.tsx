/**
 * Root application layout.
 *
 * This top-level layout is used by Next.js to wrap every page in the app.
 * It currently forwards children directly and leaves locale-specific rendering
 * to the localized layout at `src/app/[locale]/layout.tsx`.
 */
export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
