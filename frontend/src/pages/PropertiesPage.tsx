import { useEffect, useState } from 'react';
import { PropertyCard } from '../components/PropertyCard';
import { Property } from '../types';
import { propertyService } from '../services/propertyService';
import { showcaseProperties } from '../constants/mockData';

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>(showcaseProperties);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await propertyService.list();
        if (data.length) {
          setProperties(data);
        }
      } catch (error) {
        // Fallback to showcase data gracefully
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-charcoal/60">Curated stays</p>
          <h1 className="text-4xl font-semibold text-charcoal">Residences ready for your next chapter</h1>
        </div>
        <p className="max-w-md text-sm text-charcoal/70">
          Filterless discovery by mood, climate, or cosmopolitan energy. Each residence is personally audited by our global
          curation committee.
        </p>
      </div>
      {loading ? (
        <div className="mt-16 animate-pulse text-center text-sm text-charcoal/60">Loading residences...</div>
      ) : (
        <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </section>
  );
}
