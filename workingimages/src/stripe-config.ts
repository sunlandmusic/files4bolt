export interface Product {
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
  price: number;
  currency: string;
}

export const products: Product[] = [
  {
    priceId: 'price_1SE0ozInzYpYfgpleOnhtDch',
    name: 'CHORDINATOR - PIANO XL',
    description: 'CHORDINATOR - PIANO XL : play any chord with one finger and create sophisticated chord progressions with this revolutionary music composition tool !',
    mode: 'subscription',
    price: 3.99,
    currency: 'USD'
  }
];