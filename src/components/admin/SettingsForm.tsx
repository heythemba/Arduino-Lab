'use client';

import { useState } from 'react';
import { SiteSettings, updateSiteSettings } from '@/lib/api/settings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SettingsForm({ initialSettings }: { initialSettings: SiteSettings }) {
    const [settings, setSettings] = useState(initialSettings);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateSiteSettings(settings);
            router.refresh();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid gap-6">

                {/* Social & Credits */}
                <Card>
                    <CardHeader>
                        <CardTitle>Developer & Social Links</CardTitle>
                        <CardDescription>
                            These links appear in the footer. Use this to credit the developer (yourself) and link to portfolios.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="linkedin_url">LinkedIn Profile URL</Label>
                            <Input
                                id="linkedin_url"
                                name="linkedin_url"
                                value={settings.linkedin_url || ''}
                                onChange={handleChange}
                                placeholder="https://linkedin.com/in/..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dribbble_url">Dribbble/Portfolio URL</Label>
                            <Input
                                id="dribbble_url"
                                name="dribbble_url"
                                value={settings.dribbble_url || ''}
                                onChange={handleChange}
                                placeholder="https://dribbble.com/..."
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Organization */}
                <Card>
                    <CardHeader>
                        <CardTitle>Organization Info</CardTitle>
                        <CardDescription>Links relating to the school or club.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="organization_url">Official Website URL</Label>
                            <Input
                                id="organization_url"
                                name="organization_url"
                                value={settings.organization_url || ''}
                                onChange={handleChange}
                                placeholder="https://myschool.edu"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="organization_label">Website Label (Optional)</Label>
                            <Input
                                id="organization_label"
                                name="organization_label"
                                value={settings.organization_label || ''}
                                onChange={handleChange}
                                placeholder="e.g. My School Website"
                            />
                        </div>
                        <div className="space-y-2 border-t pt-4">
                            <Label htmlFor="sponsor_url">Sponsors Page URL</Label>
                            <Input
                                id="sponsor_url"
                                name="sponsor_url"
                                value={settings.sponsor_url || ''}
                                onChange={handleChange}
                                placeholder="https://myschool.edu/sponsors"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sponsor_label">Sponsors Label (Optional)</Label>
                            <Input
                                id="sponsor_label"
                                name="sponsor_label"
                                value={settings.sponsor_label || ''}
                                onChange={handleChange}
                                placeholder="e.g. Our Partners"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Contact */}
                <Card>
                    <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                        <CardDescription>Public contact details for site visitors.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="contact_email">Contact Email</Label>
                            <Input
                                id="contact_email"
                                name="contact_email"
                                value={settings.contact_email || ''}
                                onChange={handleChange}
                                placeholder="admin@example.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contact_whatsapp">WhatsApp Number</Label>
                            <Input
                                id="contact_whatsapp"
                                name="contact_whatsapp"
                                value={settings.contact_whatsapp || ''}
                                onChange={handleChange}
                                placeholder="+216..."
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Image Upload Host */}
                <Card>
                    <CardHeader>
                        <CardTitle>Image Upload Host</CardTitle>
                        <CardDescription>
                            The external website editors will be sent to when clicking "Upload Image" in project forms. Use any image hosting service (e.g. PostImages, ImgBB, Cloudinary).
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="image_upload_url">Image Host URL</Label>
                            <Input
                                id="image_upload_url"
                                name="image_upload_url"
                                value={settings.image_upload_url || ''}
                                onChange={handleChange}
                                placeholder="https://postimages.org"
                            />
                            <p className="text-xs text-muted-foreground">
                                Leave empty to hide the Upload button in project forms.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" disabled={loading} size="lg">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Settings
                    </Button>
                </div>
            </div>
        </form>
    );
}
