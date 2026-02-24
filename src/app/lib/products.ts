
export type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic';
};

export const products: Product[] = [
  {
    id: '1',
    name: 'Arcane Dust',
    price: 12.50,
    category: 'Trade Goods',
    description: 'A common enchanting ingredient found by disenchanting magic items.',
    rarity: 'Common',
  },
  {
    id: '2',
    name: 'Mageweave Cloth',
    price: 5.25,
    category: 'Trade Goods',
    description: 'A versatile cloth used in Tailoring and First Aid.',
    rarity: 'Common',
  },
  {
    id: '3',
    name: 'Rugged Leather',
    price: 8.75,
    category: 'Trade Goods',
    description: 'Thick leather used for high-level Leatherworking recipes.',
    rarity: 'Common',
  },
  {
    id: '4',
    name: 'Thorium Ore',
    price: 15.00,
    category: 'Trade Goods',
    description: 'A valuable ore found in high-level zones.',
    rarity: 'Common',
  },
  {
    id: '5',
    name: 'Righteous Orb',
    price: 450.00,
    category: 'Trade Goods',
    description: 'A rare orb found in Stratholme, used for Crusader enchant.',
    rarity: 'Uncommon',
  },
  {
    id: '6',
    name: 'Black Lotus',
    price: 1200.00,
    category: 'Trade Goods',
    description: 'An extremely rare herb used for powerful flasks.',
    rarity: 'Rare',
  },
  {
    id: '7',
    name: 'Sulfuron Ingot',
    price: 8500.00,
    category: 'Trade Goods',
    description: 'A legendary reagent required to craft Sulfuras, Hand of Ragnaros.',
    rarity: 'Epic',
  },
  {
    id: '8',
    name: 'Mooncloth',
    price: 45.00,
    category: 'Trade Goods',
    description: 'Fine cloth infused with the power of a Moonwell.',
    rarity: 'Uncommon',
  },
  {
    id: '9',
    name: 'Fel Iron Ore',
    price: 22.30,
    category: 'Trade Goods',
    description: 'The standard ore of the Outland.',
    rarity: 'Common',
  },
  {
    id: '10',
    name: 'Peacebloom',
    price: 0.50,
    category: 'Trade Goods',
    description: 'A simple herb found in starting zones.',
    rarity: 'Common',
  },
];
