/**
 * lib/products.ts
 * Shared product data for the products list and the product details page.
 * Every product has a primary image (img) and a secondary image (img2).
 */

export type Product = {
  slug: string;
  name: string;
  img: string;
  img2?: string;
  images?: string[];
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
    img2: "/products/cardamom2.png",
    images: ["/products/cardamom.png", "/products/cardamom2.png"],
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
    img2: "/products/black_pepper2.png",
    images: ["/products/black_pepper.png", "/products/black_pepper2.png"],
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
    img2: "/products/nutmeg2.png",
    images: ["/products/nutmeg.png", "/products/nutmeg2.png"],
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
    img2: "/products/bay_leaf100.png",
    images: ["/products/bay_leaf.png", "/products/bay_leaf100.png"],
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
    img2: "/products/bay_leaf200.png",
    images: ["/products/bay_leaf.png", "/products/bay_leaf200.png"],
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
    img2: "/products/cinnamon2.png",
    images: ["/products/cinnamon.png", "/products/cinnamon2.png"],
    price: 249,
    mrp: 299,
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
    img2: "/products/star_anise2.png",
    images: ["/products/star_anise.png", "/products/star_anise2.png"],
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
    img2: "/products/mace2.png",
    images: ["/products/mace.png", "/products/mace2.png"],
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
    img2: "/products/cloves2.png",
    images: ["/products/cloves.png", "/products/cloves2.png"],
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
