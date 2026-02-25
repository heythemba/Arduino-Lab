import { createClient } from '../supabase/client';

/**
 * Represents a project without its detailed steps and attachments.
 * Used for list views and previews.
 */
export type Project = {
    /** Unique identifier for the project */
    id: string;
    /** Multilingual project title (JSONB: {en, fr, ar}) */
    title: Record<string, string>;
    /** Multilingual project description (JSONB: {en, fr, ar}) */
    description: Record<string, string>;
    /** Project category (e.g., Robotics, IoT, Sensors, Automation) */
    category: string;
    /** URL-friendly slug for routing */
    slug: string;
    /** URL to the hero/thumbnail image */
    hero_image_url: string | null;
    /** Name of the instructor who supervised this project */
    instructor_name?: string | null;
    /** Name of the school where this project was created */
    school_name?: string | null;
    /** Author information from the profiles table */
    author: {
        full_name: string;
        school_name: string;
    };
};

/**
 * Represents a single step in a project's tutorial/guide.
 */
export type Step = {
    /** Unique identifier for the step */
    id: string;
    /** Sequential order number (1, 2, 3, etc.) */
    step_number: number;
    /** Multilingual step title (JSONB: {en, fr, ar}) */
    title: Record<string, string>;
    /** Multilingual step content/instructions (JSONB: {en, fr, ar}) */
    content: Record<string, string>;
    /** Optional Arduino/C++ code snippet for this step */
    code_snippet: string | null;
    /** Optional image URL illustrating this step */
    image_url: string | null;
};

/**
 * Represents a downloadable file attached to a project.
 * Can include 3D models, Arduino code, images, and other resources.
 */
export type Attachment = {
    /** Unique identifier for the attachment */
    id: string;
    /** ID of the parent project */
    project_id: string;
    /** Type of attachment: STL (3D model), INO (Arduino code), image, or other */
    file_type: 'stl' | 'ino' | 'image' | 'other' | 'zip';
    /** Original filename */
    file_name: string;
    /** Public URL to download the file (typically from Supabase Storage) */
    file_url: string;
    /** File size in bytes, null if external link */
    file_size: number | null;
};

/**
 * Complete project with all related steps and attachments.
 * Used for detailed project views.
 */
export type FullProject = Project & {
    /** Ordered list of tutorial steps */
    steps: Step[];
    /** List of downloadable resources */
    attachments: Attachment[];
};

/**
 * Fetches a complete project by its slug, including all steps and attachments.
 * 
 * This function performs a complex join query to retrieve:
 * - Project metadata
 * - Author information from the profiles table
 * - All tutorial steps (ordered by step_number)
 * - All file attachments
 * 
 * @param slug - The URL-friendly slug identifier for the project
 * @returns The complete project object, or null if not found
 * 
 * @example
 * const project = await getProjectBySlug('my-awesome-robot');
 * if (project) {
 *   console.log(project.title.en); // Access English title
 * }
 */
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
        // PGRST116 = "Row not found" error code - expected when slug doesn't exist
        if (error.code !== 'PGRST116') {
            console.error('Error fetching project:', error);
        }
        return null;
    }

    // Ensure steps are displayed in correct sequential order
    const project = data as unknown as FullProject;
    if (project.steps) {
        project.steps.sort((a, b) => a.step_number - b.step_number);
    }

    return project;
}

/**
 * Fetches all published projects with optional search and category filtering.
 * 
 * **Search Behavior**:
 * - Category filtering is applied at the database level for efficiency
 * - Text search is performed client-side due to JSONB field limitations
 * - Search queries match against all language variants (en/fr/ar) in titles and descriptions
 * 
 * **Note**: For production with large datasets, consider implementing PostgreSQL
 * Full-Text Search (FTS) or a dedicated search service like Algolia.
 * 
 * @param options - Filter options
 * @param options.query - Optional text search query (case-insensitive, searches across all languages)
 * @param options.category - Optional category filter (e.g., "Robotics", "IoT"). Use "All" or omit to skip filtering.
 * @returns Array of projects matching the filters (without steps/attachments)
 * 
 * @example
 * // Get all robotics projects
 * const robots = await getProjects({ category: 'Robotics' });
 * 
 * // Search for projects containing "arduino"
 * const results = await getProjects({ query: 'arduino' });
 */
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

    // Apply category filter at database level for performance

    const { data, error } = await dbQuery;

    if (error) {
        console.error('Error fetching projects:', error);
        return [];
    }

    // Client-side text search across JSONB multilingual fields
    // TODO: Migrate to PostgreSQL FTS or tsvector for better performance with large datasets
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
