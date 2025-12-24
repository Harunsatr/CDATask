import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Property } from '../types';

interface Props {
  property: Property;
}

export function PropertyCard({ property }: Props) {
  return (
    <motion.article
      className="gradient-border flex flex-col overflow-hidden rounded-3xl bg-white/90"
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
    >
      <div
        className="relative h-64 w-full bg-cover bg-center"
        style={{ backgroundImage: `url(${property.images?.[0] ?? 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85'})` }}
      >
        {property.rating && (
          <div className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-sm">
            <span className="text-gold">★</span>
            <span className="font-semibold">{property.rating}</span>
            {property.review_count && (
              <span className="text-charcoal/60">({property.review_count})</span>
            )}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-charcoal/60">
          <span>{property.location}</span>
          <span>${property.price_per_night.toLocaleString()} / night</span>
        </div>
        <h3 className="text-2xl font-semibold text-charcoal">{property.name}</h3>
        <p className="flex-1 text-sm text-charcoal/70">{property.description?.slice(0, 120)}...</p>
        <div className="flex items-center gap-4 text-xs text-charcoal/60">
          {property.bedrooms && <span>{property.bedrooms} Bedrooms</span>}
          {property.bathrooms && <span>{property.bathrooms} Bathrooms</span>}
          <span>Up to {property.max_guests} guests</span>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-charcoal/60">
          {property.amenities?.slice(0, 3).map((amenity) => (
            <span key={amenity} className="rounded-full border border-platinum px-3 py-1">
              {amenity}
            </span>
          ))}
        </div>
        <Link to={`/properties/${property.id}`} className="text-sm font-semibold text-gold">
          Explore Residence →
        </Link>
      </div>
    </motion.article>
  );
}
