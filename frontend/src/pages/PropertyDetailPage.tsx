import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { propertyService } from '../services/propertyService';
import { Property } from '../types';
import { showcaseProperties } from '../constants/mockData';
import { useAuth } from '../hooks/useAuth';

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const data = await propertyService.getById(id);
        if (data) {
          setProperty(data);
        }
      } catch (error) {
        const fallback = showcaseProperties.find((item) => item.id === id);
        if (fallback) {
          setProperty(fallback as Property);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleBookNow = () => {
    if (!user) {
      navigate('/login', { state: { from: `/properties/${id}` } });
      return;
    }
    navigate(`/booking?property=${id}`);
  };

  if (loading) {
    return <div className="mx-auto max-w-5xl px-6 py-16">Loading property...</div>;
  }

  if (!property) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-24 text-center">
        <p className="text-lg text-charcoal/70">Residence not found.</p>
        <Link to="/properties" className="mt-6 inline-block text-gold">
          Return to collection
        </Link>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-6xl px-6 py-16">
      {/* Image Gallery */}
      <div className="space-y-4">
        <div 
          className="rounded-[40px] bg-cover bg-center" 
          style={{ height: 480, backgroundImage: `url(${property.images?.[activeImage] || property.images?.[0]})` }} 
        />
        {property.images && property.images.length > 1 && (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {property.images.map((img, idx) => (
              <button
                key={img}
                type="button"
                onClick={() => setActiveImage(idx)}
                aria-label={`View image ${idx + 1} of ${property.images!.length}`}
                className={`flex-shrink-0 h-20 w-32 rounded-xl bg-cover bg-center transition-all ${
                  activeImage === idx ? 'ring-2 ring-gold ring-offset-2' : 'opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundImage: `url(${img})` }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <div className="flex items-center gap-4">
            <p className="text-xs uppercase tracking-[0.4em] text-charcoal/60">{property.location}</p>
            {property.rating && (
              <div className="flex items-center gap-1 rounded-full bg-gold/10 px-3 py-1 text-sm">
                <span className="text-gold">★</span>
                <span className="font-semibold">{property.rating}</span>
                {property.review_count && (
                  <span className="text-charcoal/60">({property.review_count} reviews)</span>
                )}
              </div>
            )}
          </div>
          <h1 className="mt-4 text-4xl font-semibold text-charcoal">{property.name}</h1>
          
          {/* Property Stats */}
          <div className="mt-6 flex flex-wrap gap-6 text-sm text-charcoal/70">
            {property.bedrooms && (
              <div className="flex items-center gap-2">
                <span className="text-lg">🛏️</span>
                <span>{property.bedrooms} Bedrooms</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center gap-2">
                <span className="text-lg">🛁</span>
                <span>{property.bathrooms} Bathrooms</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-lg">👥</span>
              <span>Up to {property.max_guests} guests</span>
            </div>
          </div>

          <p className="mt-6 text-charcoal/70 leading-relaxed">{property.description}</p>
          
          {property.address && (
            <p className="mt-4 text-sm text-charcoal/60">
              📍 {property.address}
            </p>
          )}

          {/* Amenities */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-charcoal">Amenities</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
              {property.amenities?.map((amenity) => (
                <div key={amenity} className="flex items-center gap-2 rounded-xl border border-platinum/60 px-4 py-3 text-sm text-charcoal/70">
                  <span className="text-gold">✓</span>
                  {amenity}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Booking Card */}
        <div className="h-fit sticky top-24">
          <div className="gradient-border rounded-3xl bg-white/80 p-8 shadow-lg">
            <p className="text-sm uppercase tracking-[0.4em] text-charcoal/60">Book your stay</p>
            <p className="mt-4 text-3xl font-semibold text-charcoal">
              ${property.price_per_night?.toLocaleString()}
              <span className="text-base font-normal text-charcoal/60"> / night</span>
            </p>
            
            <div className="mt-6 space-y-3 text-sm text-charcoal/70">
              <div className="flex justify-between">
                <span>Max guests</span>
                <span className="font-semibold">{property.max_guests}</span>
              </div>
              {property.bedrooms && (
                <div className="flex justify-between">
                  <span>Bedrooms</span>
                  <span className="font-semibold">{property.bedrooms}</span>
                </div>
              )}
              {property.bathrooms && (
                <div className="flex justify-between">
                  <span>Bathrooms</span>
                  <span className="font-semibold">{property.bathrooms}</span>
                </div>
              )}
            </div>

            <button 
              type="button"
              onClick={handleBookNow}
              className="mt-8 w-full rounded-full bg-gold px-6 py-4 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
            >
              Book Now
            </button>

            <p className="mt-6 text-xs text-charcoal/50 text-center">
              Secure booking • Free cancellation within 48 hours
            </p>
          </div>

          {/* Contact Info */}
          <div className="mt-6 rounded-2xl border border-platinum/60 bg-white/60 p-6 text-center">
            <p className="text-sm text-charcoal/60">Need assistance?</p>
            <p className="mt-2 text-sm font-semibold text-charcoal">24/7 Concierge Available</p>
          </div>
        </div>
      </div>
    </article>
  );
}
