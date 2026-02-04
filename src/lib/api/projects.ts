import { createClient } from '../supabase/client';

export type Project = {
    id: string;
    title: Record<string, string>;
    description: Record<string, string>;
    category: string;
    slug: string;
    hero_image_url: string | null;
    instructor_name?: string | null;
    school_name?: string | null;
    author: {
        full_name: string;
        school_name: string;
    };
};

export type Step = {
    id: string;
    step_number: number;
    title: Record<string, string>;
    content: Record<string, string>;
    code_snippet: string | null;
    image_url: string | null;
};

export type Attachment = {
    id: string;
    project_id: string;
    file_type: 'stl' | 'ino' | 'image' | 'other';
    file_name: string;
    file_url: string;
    file_size: number | null;
};

export type FullProject = Project & {
    steps: Step[];
    attachments: Attachment[];
};

export async function getProjectBySlug(slug: string): Promise<FullProject | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('projects')
        .select(`
      id,
      title,
      description,
      category,
      slug,
      hero_image_url,
      instructor_name,
      school_name,
      author:author_id(full_name, school_name),
      steps:project_steps(
        id,
        step_number,
        title,
        content,
        code_snippet,
        image_url
      ),
      attachments:project_attachments(*)
    `)
        .eq('slug', slug)
        .single();

    if (error) {
        if (error.code !== 'PGRST116') { // PGRST116 is code for no rows returned
            console.error('Error fetching project:', error);
        }
        return null;
    }

    // Sort steps by step_number
    const project = data as unknown as FullProject;
    if (project.steps) {
        project.steps.sort((a, b) => a.step_number - b.step_number);
    }

    return project;
}

export async function getProjects({
    query,
    category,
}: {
    query?: string;
    category?: string;
}) {
    const supabase = createClient();
    let dbQuery = supabase
        .from('projects')
        .select(`
      id,
      title,
      description,
      category,
      slug,
      hero_image_url,
      instructor_name,
      school_name,
      author:author_id(full_name, school_name)
    `)
        .eq('is_published', true);

    if (category && category !== 'All') {
        dbQuery = dbQuery.eq('category', category);
    }

    // Note: For simple search we stick to exact matches or simple ilike if possible.
    // Ideally, use Full Text Search in Supabase for better results, but keep it simple for now.
    // Since title/desc are JSONB, simple 'ilike' won't work perfectly on them without casting.
    // FOR NOW: We will do client-side filtering for text or strict category filtering until we add FTS functions.
    // Actually, let's just use strict Category for the DB and handle text search in the UI if the dataset is small,
    // OR we can rely on the fact that for V1 we might not have thousands of items.

    // Improving search: Let's assume title->>'en' (or current locale) text search? 
    // For simplicity V1: Fetch all published, filter in memory if query exists? 
    // No, that's bad practice.
    // Let's implement basics: Category filter at DB level.

    const { data, error } = await dbQuery;

    if (error) {
        console.error('Error fetching projects:', error);
        return [];
    }

    // Basic in-memory search for the JSONB fields since Supabase normal filter doesn't easily dig into JSONB values across all keys without specific operators.
    // A robust solution would be a Postgres function or Text Search vector.
    // Let's keep it simple: Filter in JS for the 'query' part.
    let projects = data as unknown as Project[];

    if (query) {
        const lowerQuery = query.toLowerCase();
        projects = projects.filter((p) => {
            const titleValues = Object.values(p.title).join(' ').toLowerCase();
            const descValues = Object.values(p.description).join(' ').toLowerCase();
            return titleValues.includes(lowerQuery) || descValues.includes(lowerQuery);
        });
    }

    return projects;
}
