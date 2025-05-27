import wpApi from '@/lib/api/wordpress';
import Section from '@/components/Section';
import PageHeader from '@/components/PageHeader';

function getShortText(html: string, maxLength = 180): string {
  if (!html) return '';
  const clean = html.replace(/<[^>]+>/g, '');
  if (clean.length <= maxLength) return clean;
  return clean.slice(0, maxLength).trim() + '...';
}

export default async function GoodPracticePage() {
  const items = await wpApi.getPosts(1, undefined, 'rscn_good_practice');

  return (
    <PageHeader title="Examples of Good Practice" description="Best practices and case studies from the field." titleContainerClassName="pageHeaderTitle" imageUrl="">
      <Section isFirst={true}>
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {items.posts.map((item: any) => {
              const imageUrl = item._embedded?.['wp:featuredmedia']?.[0]?.source_url || null;
              const title = item.title?.rendered || '';
              const description = item.acf?.description || item.excerpt?.rendered || item.content?.rendered || '';
              const shortDescription = getShortText(description, 180);
              return (
                <div key={item.id} className="bg-white rounded-xl border-2 flex flex-col items-center p-6 min-h-[370px]" style={{ borderColor: 'var(--theme-primary-light-text)' }}>
                  {imageUrl ? (
                    <div className="w-full flex justify-center mb-4 cardImageBorder">
                      <img src={imageUrl} alt={title} className="h-30 object-contain" />
                    </div>
                  ) : (
                    <div className="w-full flex justify-center mb-4">
                      <div className="h-20 w-20 bg-slate-100 rounded flex items-center justify-center text-slate-400 text-2xl">
                        <span>No Image</span>
                      </div>
                    </div>
                  )}
                  <p className="text-lg mb-2" style={{ color: '#001F54', fontWeight: 500, fontSize: '1.25rem', lineHeight: '1.2' }}>{title}</p>
                  <p className="text-gray-600 text-sm text-center mb-4 flex-1">{shortDescription}</p>
                  <a href={`/good-practice/${item.slug}`} className="mt-auto text-sky-500 font-medium hover:underline" style={{ color: 'var(--napoli-blue)' }}>See More</a>
                </div>
              );
            })}
          </div>
        </div>
      </Section>
    </PageHeader>
  );
} 