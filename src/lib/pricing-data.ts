import { PricingItem } from '@/types';

export const PRICING_ITEMS: Omit<PricingItem, 'id'>[] = [
  // HARDSCAPE - PAVERS & PATIOS
  { category: 'Hardscape - Pavers', name: 'Travertine Pavers (Silver, French Pattern)', unit: 'sq ft', base_price: 18.50, markup_pct: 45, description: 'Premium silver travertine, French pattern layout' },
  { category: 'Hardscape - Pavers', name: 'Travertine Pavers (Walnut, French Pattern)', unit: 'sq ft', base_price: 20.75, markup_pct: 45, description: 'Walnut travertine, French pattern layout' },
  { category: 'Hardscape - Pavers', name: 'Concrete Pavers (Belgard, 3-piece)', unit: 'sq ft', base_price: 12.25, markup_pct: 50, description: 'Belgard 3-piece system, multiple colors' },
  { category: 'Hardscape - Pavers', name: 'Porcelain Pavers (24x24)', unit: 'sq ft', base_price: 24.00, markup_pct: 40, description: '24x24 porcelain, wood or stone look' },
  { category: 'Hardscape - Pavers', name: 'Natural Flagstone (Arizona Sandstone)', unit: 'sq ft', base_price: 22.50, markup_pct: 45, description: 'Random pattern Arizona sandstone' },
  { category: 'Hardscape - Pavers', name: 'Paver Base Prep (Class 2 AB, 4")', unit: 'sq ft', base_price: 3.75, markup_pct: 60, description: 'Class 2 aggregate base, 4" compacted' },
  { category: 'Hardscape - Pavers', name: 'Paver Bedding Sand (1")', unit: 'sq ft', base_price: 0.85, markup_pct: 80, description: 'Concrete sand bedding layer' },
  { category: 'Hardscape - Pavers', name: 'Polymeric Sand Joint Fill', unit: 'sq ft', base_price: 1.25, markup_pct: 70, description: 'Techniseal HP NextGel polymeric sand' },
  { category: 'Hardscape - Pavers', name: 'Concrete Edge Restraint', unit: 'lf', base_price: 8.50, markup_pct: 55, description: 'Poured concrete edge restraint' },

  // HARDSCAPE - OUTDOOR KITCHENS
  { category: 'Hardscape - Outdoor Kitchen', name: 'BBQ Island Base (6\' linear)', unit: 'ea', base_price: 4800.00, markup_pct: 35, description: 'CMU block structure, stucco finish, 6\' counter' },
  { category: 'Hardscape - Outdoor Kitchen', name: 'BBQ Island Base (8\' linear)', unit: 'ea', base_price: 6200.00, markup_pct: 35, description: 'CMU block structure, stucco finish, 8\' counter' },
  { category: 'Hardscape - Outdoor Kitchen', name: 'Grill Insert (Blaze 32")', unit: 'ea', base_price: 2100.00, markup_pct: 25, description: 'Blaze Professional 32" built-in grill' },
  { category: 'Hardscape - Outdoor Kitchen', name: 'Grill Insert (Blaze 42")', unit: 'ea', base_price: 3200.00, markup_pct: 25, description: 'Blaze Professional 42" built-in grill' },
  { category: 'Hardscape - Outdoor Kitchen', name: 'Outdoor Rated Fridge (24")', unit: 'ea', base_price: 1450.00, markup_pct: 30, description: 'Summit 24" outdoor refrigerator' },
  { category: 'Hardscape - Outdoor Kitchen', name: 'Outdoor Sink & Faucet Kit', unit: 'ea', base_price: 650.00, markup_pct: 40, description: 'Stainless sink, gooseneck faucet, drain kit' },
  { category: 'Hardscape - Outdoor Kitchen', name: 'Access Doors (Double, 30")', unit: 'ea', base_price: 420.00, markup_pct: 45, description: 'Stainless double access doors' },
  { category: 'Hardscape - Outdoor Kitchen', name: 'Power & Gas Rough-in', unit: 'ea', base_price: 1200.00, markup_pct: 40, description: 'Electrical subpanel, gas line to island' },
  { category: 'Hardscape - Outdoor Kitchen', name: 'Countertop (Granite, 3cm)', unit: 'sf', base_price: 85.00, markup_pct: 35, description: 'Granite slab, 3cm, polished, eased edge' },
  { category: 'Hardscape - Outdoor Kitchen', name: 'Countertop (Quartz, 3cm)', unit: 'sf', base_price: 110.00, markup_pct: 30, description: 'Quartz slab, 3cm, polished, eased edge' },

  // HARDSCAPE - FIRE FEATURES
  { category: 'Hardscape - Fire Features', name: 'Gas Fire Pit (48" Round, Auto-Ignition)', unit: 'ea', base_price: 3800.00, markup_pct: 40, description: '48" round, Arizona sandstone coping, electronic ignition' },
  { category: 'Hardscape - Fire Features', name: 'Gas Fire Pit (60" Linear, Auto-Ignition)', unit: 'ea', base_price: 5200.00, markup_pct: 38, description: '60" linear, modern coping, electronic ignition' },
  { category: 'Hardscape - Fire Features', name: 'Wood Burning Fire Pit (48")', unit: 'ea', base_price: 2100.00, markup_pct: 45, description: '48" steel insert, stone veneer surround' },
  { category: 'Hardscape - Fire Features', name: 'Fireplace (Outdoor, 48" Box)', unit: 'ea', base_price: 8500.00, markup_pct: 35, description: 'Superior 48" outdoor wood fireplace, chimney' },
  { category: 'Hardscape - Fire Features', name: 'Gas Line Run (up to 50\')', unit: 'ea', base_price: 850.00, markup_pct: 50, description: 'Gas line from meter to fire feature' },
  { category: 'Hardscape - Fire Features', name: 'Gas Line Run (50-100\')', unit: 'ea', base_price: 1450.00, markup_pct: 50, description: 'Extended gas line run' },

  // HARDSCAPE - PERGOLAS & STRUCTURES
  { category: 'Hardscape - Structures', name: 'Aluminum Louvered Pergola (16x20)', unit: 'ea', base_price: 14500.00, markup_pct: 30, description: 'StruXure/Equinox 16x20, motorized louvers, LED, fans' },
  { category: 'Hardscape - Structures', name: 'Aluminum Louvered Pergola (20x20)', unit: 'ea', base_price: 18200.00, markup_pct: 30, description: 'StruXure/Equinox 20x20, motorized louvers, LED, fans' },
  { category: 'Hardscape - Structures', name: 'Wood Pergola (Cedar, 12x16)', unit: 'ea', base_price: 6800.00, markup_pct: 40, description: 'Western red cedar, 12x16, stained/sealed' },
  { category: 'Hardscape - Structures', name: 'Wood Pergola (Cedar, 16x20)', unit: 'ea', base_price: 9200.00, markup_pct: 40, description: 'Western red cedar, 16x20, stained/sealed' },
  { category: 'Hardscape - Structures', name: 'Pergola Footings (4-6 piers)', unit: 'ea', base_price: 1800.00, markup_pct: 50, description: 'Concrete piers, 24" dia x 36" deep' },
  { category: 'Hardscape - Structures', name: 'Permit Package (Pergola/Structure)', unit: 'ea', base_price: 1200.00, markup_pct: 20, description: 'Engineered drawings, permit submission, inspections' },

  // HARDSCAPE - WATER FEATURES
  { category: 'Hardscape - Water Features', name: 'Pondless Waterfall (6\' stream)', unit: 'ea', base_price: 6800.00, markup_pct: 35, description: '6\' recirculating stream, basalt columns, basin' },
  { category: 'Hardscape - Water Features', name: 'Pondless Waterfall (12\' stream)', unit: 'ea', base_price: 10500.00, markup_pct: 35, description: '12\' recirculating stream, multiple drops' },
  { category: 'Hardscape - Water Features', name: 'Formal Fountain (48" Diameter)', unit: 'ea', base_price: 4200.00, markup_pct: 40, description: 'Cast stone tiered fountain, auto-fill' },
  { category: 'Hardscape - Water Features', name: 'Spillway Bowl (36")', unit: 'ea', base_price: 2800.00, markup_pct: 40, description: 'GFRC spillway bowl, plumbing, pump vault' },

  // HARDSCAPE - RETAINING WALLS
  { category: 'Hardscape - Walls', name: 'Segmental Retaining Wall (Keystone, <4\')', unit: 'sf', base_price: 38.00, markup_pct: 45, description: 'Keystone Compac, <4\' exposed, geogrid' },
  { category: 'Hardscape - Walls', name: 'Segmental Retaining Wall (Keystone, 4-6\')', unit: 'sf', base_price: 48.00, markup_pct: 45, description: 'Keystone Compac, 4-6\' exposed, geogrid' },
  { category: 'Hardscape - Walls', name: 'Seat Wall (18" cap, 12" deep)', unit: 'lf', base_price: 185.00, markup_pct: 50, description: 'CMU core, stone veneer, 18" cap' },
  { category: 'Hardscape - Walls', name: 'Freestanding Wall (CMU + Veneer)', unit: 'sf', base_price: 42.00, markup_pct: 45, description: '8" CMU, cultured stone veneer both sides' },

  // LANDSCAPE - ARTIFICIAL TURF
  { category: 'Landscape - Turf', name: 'Artificial Turf (CoolTouch Pro 1.75")', unit: 'sq ft', base_price: 9.75, markup_pct: 55, description: 'CoolTouch Pro, 1.75" pile, 95oz, cooling tech' },
  { category: 'Landscape - Turf', name: 'Artificial Turf (Putting Green)', unit: 'sq ft', base_price: 14.50, markup_pct: 50, description: 'ProPutt, 5/8" pile, stimp 10-11' },
  { category: 'Landscape - Turf', name: 'Turf Base Prep (Class 2 AB, 3")', unit: 'sq ft', base_price: 2.85, markup_pct: 65, description: '3" Class 2 AB, compacted, weed barrier' },
  { category: 'Landscape - Turf', name: 'Turf Infill (Envirofill)', unit: 'sq ft', base_price: 1.85, markup_pct: 60, description: 'Envirofill acrylic coated sand infill' },
  { category: 'Landscape - Turf', name: 'Turf Edging (Steel, 1/8x4")', unit: 'lf', base_price: 6.50, markup_pct: 55, description: '1/8" x 4" steel landscape edging' },

  // LANDSCAPE - PLANTINGS
  { category: 'Landscape - Plantings', name: 'Tree (24" Box, Palo Verde/Mesquite)', unit: 'ea', base_price: 480.00, markup_pct: 50, description: '24" box desert tree, planted with amendments' },
  { category: 'Landscape - Plantings', name: 'Tree (36" Box, Specimen)', unit: 'ea', base_price: 1200.00, markup_pct: 45, description: '36" box specimen tree, crane may be needed' },
  { category: 'Landscape - Plantings', name: 'Shrub (5-gallon, Desert Varieties)', unit: 'ea', base_price: 42.00, markup_pct: 60, description: 'Texas sage, lantana, bird of paradise, etc.' },
  { category: 'Landscape - Plantings', name: 'Shrub (15-gallon, Large)', unit: 'ea', base_price: 185.00, markup_pct: 50, description: '15-gallon olive, pistache, etc.' },
  { category: 'Landscape - Plantings', name: 'Groundcover (1-gallon, Flats of 18)', unit: 'flat', base_price: 65.00, markup_pct: 55, description: 'Trailing lantana, verbena, ice plant' },
  { category: 'Landscape - Plantings', name: 'Boulder Placement (2-3ft)', unit: 'ea', base_price: 280.00, markup_pct: 60, description: 'Decorative boulder, placed by machine' },

  // LANDSCAPE - IRRIGATION
  { category: 'Landscape - Irrigation', name: 'Drip Zone (up to 200\')', unit: 'zone', base_price: 650.00, markup_pct: 50, description: 'New drip zone: valve, tubing, emitters, timer' },
  { category: 'Landscape - Irrigation', name: 'Spray/Rotor Zone (up to 1200 sf)', unit: 'zone', base_price: 850.00, markup_pct: 45, description: 'New spray/rotor zone for turf' },
  { category: 'Landscape - Irrigation', name: 'Smart Controller (Rachio/Hunter)', unit: 'ea', base_price: 420.00, markup_pct: 35, description: 'WiFi smart controller, 16-zone' },
  { category: 'Landscape - Irrigation', name: 'Backflow Preventer (1")', unit: 'ea', base_price: 650.00, markup_pct: 40, description: 'Febco 825YA 1", installed, tested, permitted' },
  { category: 'Landscape - Irrigation', name: 'Mainline & Valve Manifold', unit: 'lf', base_price: 18.00, markup_pct: 55, description: 'SCH 40 PVC mainline, valve manifold box' },

  // LANDSCAPE - HARDSCAPE ACCENTS
  { category: 'Landscape - Accents', name: 'Decomposed Granite (Stabilized, 3")', unit: 'sq ft', base_price: 4.25, markup_pct: 55, description: 'DG with stabilizer, 3" compacted' },
  { category: 'Landscape - Accents', name: 'Steel Edging (1/8x4")', unit: 'lf', base_price: 6.50, markup_pct: 55, description: '1/8" x 4" steel, painted black' },
  { category: 'Landscape - Accents', name: 'Landscape Lighting (Path Light)', unit: 'ea', base_price: 185.00, markup_pct: 50, description: 'FX Luminaire path light, LED, installed' },
  { category: 'Landscape - Accents', name: 'Landscape Lighting (Up Light)', unit: 'ea', base_price: 220.00, markup_pct: 45, description: 'FX Luminaire up-light, LED, installed' },
  { category: 'Landscape - Accents', name: 'Landscape Lighting (Transformer + Wire)', unit: 'ea', base_price: 650.00, markup_pct: 40, description: '300W transformer, 12V wire, connections' },
  { category: 'Landscape - Accents', name: 'Permit (Irrigation Backflow)', unit: 'ea', base_price: 350.00, markup_pct: 20, description: 'City permit for backflow preventer' },

  // DEMO & PREP
  { category: 'Demo & Prep', name: 'Concrete Demo & Haul (4" slab)', unit: 'sq ft', base_price: 4.50, markup_pct: 60, description: 'Jackhammer, haul away, disposal fees' },
  { category: 'Landscape - Demo', name: 'Sod/Lawn Removal & Haul', unit: 'sq ft', base_price: 1.25, markup_pct: 70, description: 'Sod cutter, haul, disposal' },
  { category: 'Demo & Prep', name: 'Grading (Skid Steer, 1/2 day)', unit: 'ea', base_price: 850.00, markup_pct: 40, description: 'Rough grading, skid steer 4 hours' },
  { category: 'Demo & Prep', name: 'Grading (Skid Steer, full day)', unit: 'ea', base_price: 1450.00, markup_pct: 40, description: 'Rough grading, skid steer 8 hours' },
  { category: 'Demo & Prep', name: 'Dumpster (20 yard, 7 day)', unit: 'ea', base_price: 580.00, markup_pct: 25, description: '20-yard roll-off, 7-day rental' },

  // GENERAL
  { category: 'General', name: 'Project Management (15% of direct costs)', unit: 'pct', base_price: 0.15, markup_pct: 0, description: 'Applied to direct cost subtotal' },
  { category: 'General', name: 'Mobilization & Supervision', unit: 'day', base_price: 650.00, markup_pct: 20, description: 'Daily crew lead supervision & mobilization' },
  { category: 'General', name: 'HOA Submission Package', unit: 'ea', base_price: 450.00, markup_pct: 30, description: 'Drawings, specs, application prep for HOA' },
];

export const TAX_RATE = 0.086; // Arizona combined state+county ~8.6%

export function calculateLineTotal(item: PricingItem, quantity: number): number {
  const unitPrice = item.base_price * (1 + item.markup_pct / 100);
  return Math.round(unitPrice * quantity * 100) / 100;
}