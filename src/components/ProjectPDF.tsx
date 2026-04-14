import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';

// Register fonts for rendering
Font.register({
    family: 'NotoSans',
    src: 'https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@main/hinted/ttf/NotoSans/NotoSans-Regular.ttf',
});

Font.register({
    family: 'NotoSansArabic',
    src: 'https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@main/hinted/ttf/NotoSansArabic/NotoSansArabic-Regular.ttf',
});

Font.register({
    family: 'NotoSansMono',
    src: 'https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@main/hinted/ttf/NotoSansMono/NotoSansMono-Regular.ttf',
});

const decodeHtml = (html: string): string => {
    return html
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&nbsp;/g, ' ');
};

const stripHtml = (html: string): string => {
    if (!html) return '';
    let text = html
        .replace(/<\/p>/gi, '\n')
        .replace(/<\/li>/gi, '\n')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/div>/gi, '\n')
        .replace(/<[^>]*>?/gm, '');
    return decodeHtml(text).replace(/\n{3,}/g, '\n\n').trim();
};

const formatArduinoCode = (text: string | null | undefined): string => {
    if (!text) return '';

    const firstHash = text.indexOf('#');
    const lastBrace = text.lastIndexOf('}');

    if (firstHash !== -1 && lastBrace !== -1 && lastBrace > firstHash) {
        const before = text.substring(0, firstHash);
        const codeBlock = text.substring(firstHash, lastBrace + 1);
        const after = text.substring(lastBrace + 1);

        let formatted = codeBlock
            .replace(/\{/g, '{\n')
            .replace(/\}/g, '\n}')
            .replace(/;(?!\n)/g, ';\n')
            .replace(/\n#/g, '\n#')
            .replace(/([^\n])#/g, '$1\n#');

        formatted = formatted.replace(/\n{2,}/g, '\n').trim();

        return [before.trim(), formatted, after.trim()].filter(Boolean).join('\n\n');
    }

    return text;
};

// Create standard styles
const styles = StyleSheet.create({
    page: {
        padding: 40,
        backgroundColor: '#ffffff',
    },
    header: {
        marginBottom: 20,
        paddingBottom: 10,
        borderBottom: '2px solid #eeeeee',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#1a1a1a',
    },
    badgeRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 10,
    },
    badge: {
        fontSize: 10,
        padding: '4 8',
        backgroundColor: '#f1f5f9',
        color: '#475569',
        borderRadius: 4,
    },
    coverImage: {
        width: '100%',
        height: 200,
        objectFit: 'cover',
        borderRadius: 8,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
        paddingTop: 10,
        borderTop: '1px solid #eeeeee',
    },
    description: {
        fontSize: 12,
        lineHeight: 1.5,
        color: '#334155',
        marginBottom: 10,
    },
    stepContainer: {
        marginBottom: 20,
        padding: 15,
        backgroundColor: '#f8fafc',
        borderRadius: 8,
    },
    stepHeader: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 8,
    },
    stepBody: {
        fontSize: 12,
        lineHeight: 1.5,
        color: '#334155',
        marginBottom: 10,
    },
    stepImage: {
        width: '100%',
        borderRadius: 6,
        marginVertical: 10,
    },
    codeBlock: {
        fontFamily: 'NotoSansMono',
        fontSize: 10,
        backgroundColor: '#f1f5f9',
        padding: 10,
        borderRadius: 4,
        color: '#0f172a',
        marginTop: 10,
    },
    pageNumber: {
        position: 'absolute',
        fontSize: 10,
        bottom: 20,
        left: 0,
        right: 0,
        textAlign: 'center',
        color: '#94a3b8',
    },
});

type ExtendedStep = {
    id: string;
    step_number: number;
    title?: Record<string, string>;
    content?: Record<string, string>;
    code_snippet?: string | null;
    image_url?: string | null;
    imageBase64?: string | null;
};

export type ProjectDocumentProps = {
    project: {
        title: Record<string, string>;
        description: Record<string, string>;
        category: string;
        steps: ExtendedStep[];
        coverBase64?: string | null;
    };
    locale: string;
};

export const ProjectDocument = ({ project, locale }: ProjectDocumentProps) => {
    const isArabic = locale === 'ar';
    const fontFamily = isArabic ? 'NotoSansArabic' : 'NotoSans';

    // Ensure we have fallbacks
    const title = project.title?.[locale] || project.title?.['en'] || 'Project';
    const description = project.description?.[locale] || project.description?.['en'] || '';

    return (
        <Document>
            <Page
                size="A4"
                style={[
                    styles.page,
                    {
                        fontFamily,
                        direction: isArabic ? 'rtl' : 'ltr',
                    }
                ]}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>{title}</Text>
                    <View style={[styles.badgeRow, { flexDirection: isArabic ? 'row-reverse' : 'row' }]}>
                        <Text style={styles.badge}>{project.category}</Text>
                    </View>
                </View>

                {/* Cover Image */}
                {project.coverBase64 && (
                    <Image src={project.coverBase64} style={styles.coverImage} />
                )}

                {/* Description */}
                {description && (
                    <Text style={styles.description}>{stripHtml(description)}</Text>
                )}

                {/* Steps */}
                {project.steps && project.steps.length > 0 && (
                    <View>
                        <Text style={styles.sectionTitle}>
                            {isArabic ? 'الخطوات' : locale === 'fr' ? 'Étapes' : 'Steps'}
                        </Text>
                        
                        {project.steps.map((step, index) => {
                            const stepTitle = step.title?.[locale] || step.title?.['en'] || `Step ${index + 1}`;
                            const content = step.content?.[locale] || step.content?.['en'] || '';
                            
                            return (
                                <View key={step.id || index.toString()} style={styles.stepContainer} wrap={false}>
                                    <Text style={styles.stepHeader}>
                                        {index + 1}. {stepTitle}
                                    </Text>
                                    
                                    {content && (
                                        <Text style={styles.stepBody}>{formatArduinoCode(stripHtml(content))}</Text>
                                    )}

                                    {step.imageBase64 && (
                                        <Image src={step.imageBase64} style={styles.stepImage} />
                                    )}

                                    {step.code_snippet && (
                                        <Text style={styles.codeBlock}>{formatArduinoCode(step.code_snippet)}</Text>
                                    )}
                                </View>
                            );
                        })}
                    </View>
                )}

                {/* Footer Page Number */}
                <Text
                    style={styles.pageNumber}
                    render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
                    fixed
                />
            </Page>
        </Document>
    );
};
