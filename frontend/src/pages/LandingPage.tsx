import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { PropertyCard } from '../components/PropertyCard';
import { showcaseProperties } from '../constants/mockData';

const stats = [
  { label: 'Curated Residences', value: '180+' },
  { label: 'Countries', value: '42' },
  { label: 'Concierge Partners', value: '95' },
  { label: 'Guest Rating', value: '4.9/5' },
];

export default function LandingPage() {
  return (
    <section>
      <div className="relative overflow-hidden bg-white/60">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-xs uppercase tracking-[0.4em] text-charcoal/60">For the rare traveler</p>
            <h1 className="mt-6 text-4xl font-semibold leading-tight text-charcoal md:text-6xl">
              Tailor-made residences curated for singular journeys.
            </h1>
            <p className="mt-6 text-lg text-charcoal/70">
              LuxePortal pairs architectural icons with end-to-end concierge intelligence: private aviation, immersive dining,
              and on-call cultural specialists.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button as="a" href="/properties">
                Discover Collection
              </Button>
              <Button as="a" href="/booking" variant="secondary">
                Plan Bespoke Trip
              </Button>
            </div>
            <div className="mt-14 grid gap-4 sm:grid-cols-2">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-3xl border border-platinum/60 p-6">
                  <p className="text-3xl font-semibold text-charcoal">{stat.value}</p>
                  <p className="text-xs uppercase tracking-[0.3em] text-charcoal/60">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="gradient-border rounded-[40px] bg-white/80 p-8"
          >
            <p className="text-xs uppercase tracking-[0.4em] text-charcoal/60">Concierge spotlight</p>
            <h2 className="mt-6 text-2xl font-semibold text-charcoal">Pacific Tranquility Circuit</h2>
            <p className="mt-4 text-sm text-charcoal/70">
              A 12-night route weaving Kyoto ryokans, Jeju art villas, and Fiji overwater suites with seaplane transfers.
            </p>
            <ul className="mt-8 space-y-4 text-sm text-charcoal">
              <li>• Michelin Grade Dining Residency</li>
              <li>• Private archivist-led gallery access</li>
              <li>• Tailored wellness bio-tracking</li>
            </ul>
            <Link to="/booking" className="mt-10 inline-flex items-center text-sm font-semibold text-gold">
              Consult Atelier <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-20" id="collections">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-charcoal/60">Signature residences</p>
            <h2 className="mt-4 text-3xl font-semibold text-charcoal">Tastemaker Collection</h2>
          </div>
          <Link to="/properties" className="text-sm font-semibold text-gold">
            View all properties
          </Link>
        </div>
        <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {showcaseProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </section>
  );
}
