
export type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  availability: 'In Stock' | 'Out of Stock' | 'Pre-order';
};

export const products: Product[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro',
    price: 999.0,
    category: 'Electronics',
    description: 'The latest iPhone with a titanium design and A17 Pro chip.',
    availability: 'In Stock',
  },
  {
    id: '2',
    name: 'Samsung Galaxy S24 Ultra',
    price: 1299.99,
    category: 'Electronics',
    description: 'Samsung flagship with AI features and an integrated S Pen.',
    availability: 'In Stock',
  },
  {
    id: '3',
    name: 'MacBook Air M3',
    price: 1099.0,
    category: 'Computers',
    description: 'Thin, light, and powerful laptop with the M3 chip.',
    availability: 'In Stock',
  },
  {
    id: '4',
    name: 'Sony WH-1000XM5 Headphones',
    price: 398.0,
    category: 'Audio',
    description: 'Industry-leading noise-canceling headphones.',
    availability: 'In Stock',
  },
  {
    id: '5',
    name: 'Nintendo Switch OLED',
    price: 349.99,
    category: 'Gaming',
    description: 'Versatile gaming console with a vibrant OLED screen.',
    availability: 'Out of Stock',
  },
  {
    id: '6',
    name: 'Kindle Paperwhite',
    price: 139.99,
    category: 'E-Readers',
    description: 'Waterproof e-reader with an adjustable warm light.',
    availability: 'In Stock',
  },
  {
    id: '7',
    name: 'Dyson V15 Detect',
    price: 749.99,
    category: 'Home Appliances',
    description: 'Powerful cordless vacuum with laser dust detection.',
    availability: 'In Stock',
  },
  {
    id: '8',
    name: 'AirPods Pro (2nd Gen)',
    price: 249.0,
    category: 'Audio',
    description: 'Advanced noise cancellation and spatial audio.',
    availability: 'In Stock',
  },
  {
    id: '9',
    name: 'Logitech MX Master 3S',
    price: 99.99,
    category: 'Accessories',
    description: 'High-performance ergonomic mouse.',
    availability: 'In Stock',
  },
  {
    id: '10',
    name: 'ASUS ROG Zephyrus G14',
    price: 1599.99,
    category: 'Computers',
    description: 'Compact yet powerful gaming laptop.',
    availability: 'Pre-order',
  },
];
