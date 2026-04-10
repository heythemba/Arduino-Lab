/**
 * Authentication layout wrapper.
 *
 * Used for auth-related pages under /auth and provides a minimal HTML shell
 * around login or callback screens.
 */
export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                {children}
            </body>
        </html>
    );
}
