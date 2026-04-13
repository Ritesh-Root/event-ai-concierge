/**
 * @fileoverview Realistic fake event data for demo purposes.
 * Represents a full-day tech conference with sessions, booths,
 * accessibility features, and facility information.
 * @module utils/eventData
 */

const eventData = {
  name: 'InnovateSphere 2026',
  tagline: 'Where Ideas Converge',
  date: '2026-05-17',
  venue: {
    name: 'Meridian Convention Centre',
    address: '1200 Innovation Drive, Bengaluru, Karnataka 560100',
    floors: 3,
    totalCapacity: 2500,
  },
  wifi: {
    network: 'InnovateSphere-Guest',
    password: 'Sphere2026!',
    helpDesk: 'Visit the Info Kiosk near Gate A for connectivity issues.',
  },
  emergency: {
    securityDesk: 'Ground Floor, Gate B — available 24/7 during the event.',
    medicalRoom: 'Room G-04, Ground Floor (staffed paramedic on site).',
    emergencyNumber: '112',
    evacuationPoints: [
      'Gate A — Main Entrance (Ground Floor)',
      'Gate C — East Wing Exit (Ground Floor)',
      'Terrace Stairwell D (Floors 1-3)',
    ],
  },
  sessions: [
    {
      time: '09:00–09:45',
      title: 'Opening Keynote: The Ambient AI Era',
      speaker: 'Dr. Kavitha Rajan',
      room: 'Grand Hall A (Floor 1)',
      track: 'Keynote',
      accessibility:
        'Wheelchair-accessible seating in rows 1-3; live captions on screen; sign-language interpreter available.',
    },
    {
      time: '10:00–10:45',
      title: 'Building Responsible LLM Applications',
      speaker: 'Arjun Mehta',
      room: 'Room 201 (Floor 2)',
      track: 'AI & Ethics',
      accessibility:
        'Elevator access from lobby; assistive listening devices at entrance.',
    },
    {
      time: '11:00–11:45',
      title: 'Edge Computing for Real-Time Analytics',
      speaker: 'Priya Nair',
      room: 'Room 202 (Floor 2)',
      track: 'Infrastructure',
      accessibility: 'Step-free access; reserved front-row seating.',
    },
    {
      time: '13:00–13:45',
      title: 'Design Systems at Scale',
      speaker: 'Liam Chen',
      room: 'Workshop Lab B (Floor 1)',
      track: 'Design',
      accessibility:
        'Adjustable-height tables; screen magnification on presenter display.',
    },
    {
      time: '14:00–14:45',
      title: 'Securing Cloud-Native Microservices',
      speaker: 'Fatima Al-Sayed',
      room: 'Room 301 (Floor 3)',
      track: 'Security',
      accessibility:
        'Elevator access; hearing loop installed; materials available in large print.',
    },
    {
      time: '15:30–16:30',
      title: 'Closing Panel: Tech for Social Good',
      speaker: 'Panel — moderated by Ravi Sharma',
      room: 'Grand Hall A (Floor 1)',
      track: 'Keynote',
      accessibility:
        'Full wheelchair access; live captions; sign-language interpreter; quiet seating zone at rear.',
    },
  ],
  booths: [
    {
      id: 'B1',
      name: 'Google Cloud AI',
      location: 'Expo Hall, Aisle 1',
      category: 'Cloud & AI',
    },
    {
      id: 'B2',
      name: 'Vercel',
      location: 'Expo Hall, Aisle 1',
      category: 'Developer Tools',
    },
    {
      id: 'B3',
      name: 'Figma',
      location: 'Expo Hall, Aisle 2',
      category: 'Design',
    },
    {
      id: 'B4',
      name: 'Snyk',
      location: 'Expo Hall, Aisle 2',
      category: 'Security',
    },
    {
      id: 'B5',
      name: 'MongoDB',
      location: 'Expo Hall, Aisle 3',
      category: 'Databases',
    },
    {
      id: 'B6',
      name: 'Stripe',
      location: 'Expo Hall, Aisle 3',
      category: 'Fintech',
    },
    {
      id: 'B7',
      name: 'Notion',
      location: 'Expo Hall, Aisle 4',
      category: 'Productivity',
    },
    {
      id: 'B8',
      name: 'Arduino',
      location: 'Expo Hall, Aisle 4',
      category: 'Hardware & IoT',
    },
  ],
  quietZones: [
    {
      name: 'Zen Lounge',
      location: 'Floor 1, West Wing — near the indoor garden.',
      amenities: 'Comfortable seating, dim lighting, phone-free zone.',
    },
    {
      name: 'Focus Pod Area',
      location: 'Floor 2, East Corridor — individual sound-dampened pods.',
      amenities: 'Power outlets, adjustable lighting, bookable in 30-min slots.',
    },
    {
      name: 'Terrace Garden',
      location:
        'Floor 3, open-air terrace — weather permitting (covered section available).',
      amenities: 'Fresh air, bench seating, water station.',
    },
  ],
  wheelchairAccessibleRoutes: [
    {
      name: 'Main Concourse Route',
      description:
        'From Gate A entrance, proceed straight through the ground-floor lobby. Take the central elevator bank to any floor. All session rooms on Floors 1-2 are reachable without stairs. Width ≥ 1.5 m throughout.',
    },
    {
      name: 'Expo Hall Loop',
      description:
        'Enter the Expo Hall via the wide double doors near Gate B. All aisles are ≥ 2 m wide with smooth flooring. Accessible restrooms are located at both ends of the hall.',
    },
  ],
};

module.exports = eventData;
