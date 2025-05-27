import { getServices } from '@/lib/api/wordpress';
import { Service } from '@/lib/api/wordpress';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Services | RSCN',
  description: 'Explore our range of services and solutions for active and healthy ageing.',
};

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Our Services</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service: Service) => (
          <div key={service.id} className="bg-white rounded-lg shadow-md p-6">
            {service.acf?.icon && (
              <div className="text-4xl mb-4">
                <i className={service.acf.icon}></i>
              </div>
            )}
            <h2 className="text-2xl font-semibold mb-4">{service.title.rendered}</h2>
            {service.acf?.short_description && (
              <p className="text-gray-600 mb-4">{service.acf.short_description}</p>
            )}
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: service.content.rendered }}
            />
          </div>
        ))}
      </div>
    </div>
  );
} 