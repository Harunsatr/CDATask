const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuid } = require('uuid');
const roles = require('../constants/roles');

const dbPath = path.join(__dirname, 'db.json');

const hashPassword = (plain) => bcrypt.hashSync(plain, 10);

const seedData = () => {
  const merchantId = uuid();
  const properties = [
    {
      id: uuid(),
      name: 'Azure Peak Villa',
      description: 'Panoramic cliffside sanctuary with private concierge, infinity pool, and wellness suite.',
      location: 'Amalfi Coast, Italy',
      nightlyRate: 2200,
      images: ['https://images.unsplash.com/photo-1505693314120-0d443867891c'],
      amenities: ['Private chef', 'Infinity pool', 'Butler', 'Helipad access'],
      ownerId: merchantId,
      status: 'approved',
      maxGuests: 6,
      tags: ['villa', 'coastal'],
    },
    {
      id: uuid(),
      name: 'Serenity Desert Pavilion',
      description: 'Architectural statement in the desert with star observatory and temperature-controlled suites.',
      location: 'AlUla, Saudi Arabia',
      nightlyRate: 1850,
      images: ['https://images.unsplash.com/photo-1505691938895-1758d7feb511'],
      amenities: ['Spa rituals', 'Camel concierge', 'Private driver'],
      ownerId: merchantId,
      status: 'approved',
      maxGuests: 4,
      tags: ['desert', 'experience'],
    },
  ];

  const users = [
    {
      id: merchantId,
      name: 'Maison Arcadia',
      email: 'merchant@luxury.io',
      role: roles.MERCHANT,
      password: hashPassword('Merchant@123'),
      status: 'active',
    },
    {
      id: uuid(),
      name: 'Elena Cross',
      email: 'admin@luxury.io',
      role: roles.ADMIN,
      password: hashPassword('Admin@123'),
      status: 'active',
    },
    {
      id: uuid(),
      name: 'Noah Silva',
      email: 'traveler@luxury.io',
      role: roles.CUSTOMER,
      password: hashPassword('Traveler@123'),
      status: 'active',
    },
  ];

  const bookings = [];
  const payments = [];

  return { users, properties, bookings, payments };
};

const readDb = async () => {
  try {
    const raw = await fs.promises.readFile(dbPath, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return seedData();
    }
    throw error;
  }
};

const writeDb = async (data) => {
  await fs.promises.writeFile(dbPath, JSON.stringify(data, null, 2));
  return data;
};

const getDb = async () => {
  const data = await readDb();
  if (!data.users || data.users.length === 0) {
    const seeded = seedData();
    await writeDb(seeded);
    return seeded;
  }
  return data;
};

const saveDb = async (data) => writeDb(data);

module.exports = {
  getDb,
  saveDb,
};
