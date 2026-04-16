// Stadium data for Narendra Modi Stadium (Sardar Patel Stadium), Motera, Ahmedabad
// Verified GPS: 23.09139° N, 72.59722° E  (Wikipedia confirmed)

export const STADIUM_CENTER = { lat: 23.0914, lng: 72.5972 };

export const STADIUM_GATES = [
  {
    id: 'gate-1',
    name: 'Gate 1',
    shortName: 'G1',
    description: 'North Main Entry — Premium Stands Access',
    side: 'North',
    position: { lat: 23.0940, lng: 72.5972 },
    type: 'gate',
    color: '#3b82f6',
    blocks: ['Block A', 'Block B'],
    parking: 'P1 — North Parking',
    transport: 'Metro: Motera Station (500m)',
  },
  {
    id: 'gate-2',
    name: 'Gate 2',
    shortName: 'G2',
    description: 'Northeast Entry — Club House Access',
    side: 'Northeast',
    position: { lat: 23.0931, lng: 72.5994 },
    type: 'gate',
    color: '#3b82f6',
    blocks: ['Block C', 'Block D'],
    parking: 'P2 — East Parking',
    transport: 'Bus Stop: Motera Ground (200m)',
  },
  {
    id: 'gate-3',
    name: 'Gate 3',
    shortName: 'G3',
    description: 'Southeast Entry — East Stands',
    side: 'Southeast',
    position: { lat: 23.0898, lng: 72.5994 },
    type: 'gate',
    color: '#3b82f6',
    blocks: ['Block E'],
    parking: 'P3 — Southeast Parking',
    transport: 'Auto-rickshaw stand nearby',
  },
  {
    id: 'gate-4',
    name: 'Gate 4',
    shortName: 'G4',
    description: 'South Entry — General Stands',
    side: 'South',
    position: { lat: 23.0887, lng: 72.5972 },
    type: 'gate',
    color: '#3b82f6',
    blocks: ['Block F', 'Block G'],
    parking: 'P4 — South Parking',
    transport: 'Bus Stop: Chandkheda (1km)',
  },
  {
    id: 'gate-5',
    name: 'Gate 5',
    shortName: 'G5',
    description: 'Southwest Entry — West Stands',
    side: 'Southwest',
    position: { lat: 23.0898, lng: 72.5950 },
    type: 'gate',
    color: '#3b82f6',
    blocks: ['Block H'],
    parking: 'P5 — West Parking',
    transport: 'Metro: Chandkheda Station (800m)',
  },
  {
    id: 'gate-6',
    name: 'Gate 6',
    shortName: 'G6',
    description: 'Northwest Entry — VIP & Media Access',
    side: 'Northwest',
    position: { lat: 23.0931, lng: 72.5950 },
    type: 'gate',
    color: '#3b82f6',
    blocks: ['Block A', 'Block H'],
    parking: 'VIP Parking — Restricted',
    transport: 'Dedicated shuttle service',
  },
];

export const SEATING_BLOCKS = [
  { id: 'block-a', name: 'Block A', shortName: 'A', position: { lat: 23.0930, lng: 72.5963 }, type: 'block', capacity: 5000, description: 'Premium North Stand — Best pitch view' },
  { id: 'block-b', name: 'Block B', shortName: 'B', position: { lat: 23.0928, lng: 72.5981 }, type: 'block', capacity: 5000, description: 'North East Upper Tier' },
  { id: 'block-c', name: 'Block C', shortName: 'C', position: { lat: 23.0917, lng: 72.5990 }, type: 'block', capacity: 6000, description: 'Club House Stand — East' },
  { id: 'block-d', name: 'Block D', shortName: 'D', position: { lat: 23.0905, lng: 72.5988 }, type: 'block', capacity: 6000, description: 'East Stand — Lower Tier' },
  { id: 'block-e', name: 'Block E', shortName: 'E', position: { lat: 23.0898, lng: 72.5981 }, type: 'block', capacity: 5500, description: 'Southeast Stand' },
  { id: 'block-f', name: 'Block F', shortName: 'F', position: { lat: 23.0899, lng: 72.5964 }, type: 'block', capacity: 5000, description: 'South Stand — Sightscreen End' },
  { id: 'block-g', name: 'Block G', shortName: 'G', position: { lat: 23.0899, lng: 72.5979 }, type: 'block', capacity: 5000, description: 'South Stand — General' },
  { id: 'block-h', name: 'Block H', shortName: 'H', position: { lat: 23.0917, lng: 72.5954 }, type: 'block', capacity: 6000, description: 'West Stand — Sightscreen End' },
];

export const FOOD_STALLS = [
  { id: 'food-1', name: 'Chai & Snacks Corner', position: { lat: 23.0937, lng: 72.5966 }, type: 'food', description: 'Tea, samosas, kachori — North Zone', zone: 'North', items: ['Masala Chai ₹20', 'Samosa ₹15', 'Kachori ₹25'] },
  { id: 'food-2', name: 'Gujarati Bites', position: { lat: 23.0929, lng: 72.5988 }, type: 'food', description: 'Dhokla, Fafda, Jalebi — Northeast Zone', zone: 'Northeast', items: ['Dhokla ₹30', 'Fafda ₹25', 'Jalebi ₹20'] },
  { id: 'food-3', name: 'Fast Food Hub', position: { lat: 23.0908, lng: 72.5995 }, type: 'food', description: 'Burgers, Pizza, Fries — East Zone', zone: 'East', items: ['Burger ₹80', 'Pizza Slice ₹60', 'Fries ₹40'] },
  { id: 'food-4', name: 'South Zone Canteen', position: { lat: 23.0890, lng: 72.5970 }, type: 'food', description: 'Full meals, cold drinks — South Zone', zone: 'South', items: ['Thali ₹120', 'Cold Drink ₹30', 'Biryani ₹100'] },
  { id: 'food-5', name: 'West Refreshment Bar', position: { lat: 23.0902, lng: 72.5952 }, type: 'food', description: 'Juices, ice cream, snacks — West Zone', zone: 'West', items: ['Fresh Juice ₹50', 'Ice Cream ₹40', 'Popcorn ₹30'] },
  { id: 'food-6', name: 'VIP Lounge Café', position: { lat: 23.0929, lng: 72.5958 }, type: 'food', description: 'Premium café — Northwest Zone', zone: 'Northwest', items: ['Coffee ₹80', 'Sandwich ₹100', 'Pastry ₹60'] },
  { id: 'food-7', name: 'North East Stall', position: { lat: 23.0923, lng: 72.5985 }, type: 'food', description: 'Pav Bhaji, Vada Pav — NE Zone', zone: 'Northeast', items: ['Pav Bhaji ₹60', 'Vada Pav ₹20', 'Pani Puri ₹30'] },
  { id: 'food-8', name: 'Ice Cream & Desserts', position: { lat: 23.0912, lng: 72.5991 }, type: 'food', description: 'Kulfi, Ice cream, Lassi', zone: 'East', items: ['Kulfi ₹40', 'Lassi ₹50', 'Ice Cream ₹35'] },
];

export const WASHROOMS = [
  { id: 'wc-1', name: 'Washroom Block NW', position: { lat: 23.0936, lng: 72.5959 }, type: 'washroom', description: 'Near Gate 1 & Gate 6 — North Zone', zone: 'North' },
  { id: 'wc-2', name: 'Washroom Block NE', position: { lat: 23.0928, lng: 72.5987 }, type: 'washroom', description: 'Near Gate 2 — Northeast Zone', zone: 'Northeast' },
  { id: 'wc-3', name: 'Washroom Block SE', position: { lat: 23.0900, lng: 72.5990 }, type: 'washroom', description: 'Near Gate 3 — Southeast Zone', zone: 'Southeast' },
  { id: 'wc-4', name: 'Washroom Block South', position: { lat: 23.0890, lng: 72.5968 }, type: 'washroom', description: 'Near Gate 4 — South Zone', zone: 'South' },
  { id: 'wc-5', name: 'Washroom Block SW', position: { lat: 23.0901, lng: 72.5953 }, type: 'washroom', description: 'Near Gate 5 — Southwest Zone', zone: 'Southwest' },
  { id: 'wc-6', name: 'Washroom Block VIP', position: { lat: 23.0931, lng: 72.5962 }, type: 'washroom', description: 'VIP/Media Area — Premium Facilities', zone: 'North' },
];

export const HELP_POINTS = [
  { id: 'help-1', name: 'First Aid Center', position: { lat: 23.0914, lng: 72.5972 }, type: 'help', description: 'Main Medical Station — Center Field', phone: '1077' },
  { id: 'help-2', name: 'Security Control Room', position: { lat: 23.0922, lng: 72.5972 }, type: 'help', description: 'Main Security Desk', phone: '100' },
  { id: 'help-3', name: 'Lost & Found', position: { lat: 23.0926, lng: 72.5966 }, type: 'help', description: 'Gate 1 Information Desk', phone: null },
];

export const ALL_LOCATIONS = [
  ...STADIUM_GATES,
  ...FOOD_STALLS,
  ...WASHROOMS,
  ...HELP_POINTS,
];
