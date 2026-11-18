/**
 * lib/products.ts
 * Shared product data for the products list and the product details page.
 * Replace the placeholder prices, copy and details with your own.
 *
 * Every product needs a UNIQUE slug: it is used as the React key on the
 * products page and as the URL (/products/[slug]) on the details page.
 */

export type Product = {
  slug: string;
  name: string;
  img: string;
  price: number;
  mrp?: number;
  desc: string;
  details: { label: string; value: string }[];
};

export const PRODUCTS: Product[] = [
  {
    slug: "green-cardamom",
    name: "Green Cardamom 200g",
    img: "/products/cardamom.png",
    price: 495,
    mrp: 599,
    desc: "Plump, aromatic pods graded by size and sealed fresh. Use whole in tea, biryani and desserts, or crush the seeds just before cooking.",
    details: [
      { label: "Grade", value: "8mm+" },
      { label: "Origin", value: "Idukki, Kerala" },
      { label: "Net weight", value: "200 g" },
      { label: "Form", value: "Whole pods" },
    ],
  },
  {
    slug: "black-pepper",
    name: "Black Pepper 100g",
    img: "/products/black_pepper.png",
    price: 349,
    mrp: 429,
    desc: "Bold, sharp peppercorns with a strong aroma. Grind fresh over any dish for a warmth that pre-ground pepper cannot match.",
    details: [
      { label: "Grade", value: "Bold" },
      { label: "Origin", value: "Kerala" },
      { label: "Net weight", value: "100 g" },
      { label: "Form", value: "Whole" },
    ],
  },
  {
    slug: "nutmeg",
    name: "Nutmeg (Whole) 100 g",
    img: "/products/nutmeg.png",
    price: 599,
    mrp: 749,
    desc: "Whole nutmeg, slow-dried so it keeps its oils. Grate a little into sauces, milk drinks, baking and curries.",
    details: [
      { label: "Grade", value: "Whole" },
      { label: "Origin", value: "Kerala" },
      { label: "Net weight", value: "100 g" },
      { label: "Form", value: "Whole" },
    ],
  },
  {
    slug: "bay-leaf",
    name: "Bay Leaf 100g",
    img: "/products/bay_leaf.png",
    price: 129,
    mrp: 159,
    desc: "Whole leaves, dried gently to keep their colour and aroma. Add to rice, dals, stews and stocks.",
    details: [
      { label: "Grade", value: "Hand-picked" },
      { label: "Origin", value: "Kerala" },
      { label: "Net weight", value: "100 g" },
      { label: "Form", value: "Whole leaves" },
    ],
  },
  {
    slug: "bay-leaf-200g",
    name: "Bay Leaf 200g",
    img: "/products/bay_leaf.png",
    price: 239,
    mrp: 259,
    desc: "Whole leaves, dried gently to keep their colour and aroma. Add to rice, dals, stews and stocks.",
    details: [
      { label: "Grade", value: "Hand-picked" },
      { label: "Origin", value: "Kerala" },
      { label: "Net weight", value: "200 g" },
      { label: "Form", value: "Whole leaves" },
    ],
  },
  {
    slug: "cinnamon",
    name: "Cinnamon (Cassia) 100g",
    img: "/products/cinnamon.png",
    price: 249,
    desc: "Cassia cinnamon with a bold, warm flavour and a sweet finish. Simmer the sticks in tea, curries, biryani and desserts.",
    details: [
      { label: "Type", value: "Cassia" },
      { label: "Origin", value: "Kerala" },
      { label: "Net weight", value: "100 g" },
      { label: "Form", value: "Sticks" },
    ],
  },
  {
    slug: "star-anise",
    name: "Star Anise 200g",
    img: "/products/star_anise.png",
    price: 299,
    mrp: 349,
    desc: "Whole, star-shaped pods with a sweet, licorice-like aroma. Add to biryani, masala chai, stocks and slow-cooked curries.",
    details: [
      { label: "Grade", value: "Whole stars" },
      { label: "Origin", value: "Kerala" },
      { label: "Net weight", value: "200 g" },
      { label: "Form", value: "Whole" },
    ],
  },
  {
    slug: "mace",
    name: "Mace 100g",
    img: "/products/mace.png",
    price: 449,
    mrp: 529,
    desc: "Delicate blades of mace with a warm, floral flavour milder than nutmeg. Use in rich gravies, biryani, baking and spice blends.",
    details: [
      { label: "Grade", value: "Whole blades" },
      { label: "Origin", value: "Kerala" },
      { label: "Net weight", value: "100 g" },
      { label: "Form", value: "Whole" },
    ],
  },
  {
    slug: "cloves",
    name: "Cloves(Laung) 200g",
    img: "/products/cloves.png",
    price: 279,
    mrp: 329,
    desc: "Plump, intensely aromatic cloves with a strong, warming flavour. Use in rice dishes, curries, teas and pickles, a few at a time.",
    details: [
      { label: "Grade", value: "Hand-picked" },
      { label: "Origin", value: "Kerala" },
      { label: "Net weight", value: "200 g" },
      { label: "Form", value: "Whole" },
    ],
  },
];

export const discountOf = (p: Product) => (p.mrp ? Math.round((1 - p.price / p.mrp) * 100) : 0);
