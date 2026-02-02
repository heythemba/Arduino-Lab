export default function Footer() {
    return (
        <footer className="w-full border-t bg-background py-8">
            <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                <p>© {new Date().getFullYear()} ArduinoLab. Built for Makers.</p>
            </div>
        </footer>
    );
}
