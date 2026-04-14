export async function imageUrlToBase64(url: string | null): Promise<string | null> {
    if (!url) return null;
    try {
        const res = await fetch(url);
        const blob = await res.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => reject(null);
            reader.readAsDataURL(blob);
        });
    } catch {
        return null; // fail gracefully — missing image should not block PDF generation
    }
}
