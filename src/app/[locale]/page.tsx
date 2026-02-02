import { getProjects } from '@/lib/api/projects';
import Hero from '@/components/Hero';
import ProjectCard from '@/components/ProjectCard';
import SearchFilters from '@/components/SearchFilters';

export default async function HomePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { locale } = await params;
  const { q, category } = await searchParams;

  const projects = await getProjects({ query: q, category });

  return (
    <main className="h-full bg-slate-50/50">
      <Hero />

      {/* Featured Projects Section */}
      <section id="projects" className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Explore Projects</h2>
            <p className="text-muted-foreground">Discover community builds or find your next idea.</p>
          </div>

          {/* Search and Filters */}
          <SearchFilters />

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {projects.length > 0 ? (
              projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  title={project.title[locale] || project.title['en'] || 'Untitled'}
                  description={project.description[locale] || project.description['en'] || 'No description'}
                  category={project.category}
                  slug={project.slug}
                  imageUrl={project.hero_image_url || undefined}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-20 text-muted-foreground text-opacity-80">
                <div className="mb-4 text-6xl">🔍</div>
                <p className="text-xl font-medium">No projects found</p>
                <p className="text-sm mt-2">Try adjusting your filters or search terms.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
