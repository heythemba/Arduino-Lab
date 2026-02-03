import { createClient } from '../supabase/client';

export type SiteSettings = {
    linkedin_url: string;
    dribbble_url: string;
    organization_url: string;
    sponsor_url: string;
    contact_email: string;
    contact_whatsapp: string;
    organization_label?: string;
    sponsor_label?: string;
};

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

export async function updateSiteSettings(settings: Partial<SiteSettings>) {
    const supabase = createClient();
    const { error } = await supabase
        .from('site_settings')
        .update(settings)
        .eq('id', 1);

    return { error };
}
