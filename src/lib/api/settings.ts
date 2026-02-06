import { createClient } from '../supabase/client';

/**
 * Site-wide settings configuration.
 * These settings control footer links, contact information, and external integrations.
 */
export type SiteSettings = {
    /** LinkedIn profile/company page URL */
    linkedin_url: string;
    /** Dribbble portfolio URL */
    dribbble_url: string;
    /** Organization/institution website URL */
    organization_url: string;
    /** Sponsor/partner website URL */
    sponsor_url: string;
    /** Contact email address for inquiries */
    contact_email: string;
    /** WhatsApp contact number (with country code) */
    contact_whatsapp: string;
    /** Display label for the organization link (e.g., "INSAT") */
    organization_label?: string;
    /** Display label for the sponsor link (e.g., "TechCorp") */
    sponsor_label?: string;
};

/**
 * Fetches the current site settings from the database.
 * 
 * This function retrieves a single row from the `site_settings` table.
 * The settings are typically managed through the admin dashboard.
 * 
 * @returns The site settings object, or null if not found or if an error occurs
 * 
 * @example
 * const settings = await getSiteSettings();
 * if (settings) {
 *   console.log(settings.contact_email);
 * }
 */
export async function getSiteSettings(): Promise<SiteSettings | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single();

    if (error) {
        console.error('Error fetching settings:', error);
        return null;
    }
    return data;
}

/**
 * Updates site settings in the database.
 * 
 * This function should only be called from admin-protected routes.
 * It performs a partial update, allowing you to modify only specific fields.
 * 
 * @param settings - Partial settings object with fields to update
 * @returns An object containing any error that occurred during the update
 * 
 * @example
 * const result = await updateSiteSettings({
 *   contact_email: 'new@example.com',
 *   linkedin_url: 'https://linkedin.com/in/newprofile'
 * });
 * 
 * if (result.error) {
 *   console.error('Update failed:', result.error);
 * }
 */
export async function updateSiteSettings(settings: Partial<SiteSettings>) {
    const supabase = createClient();
    const { error } = await supabase
        .from('site_settings')
        .update(settings)
        .eq('id', 1); // Assumes single row with ID = 1

    return { error };
}
