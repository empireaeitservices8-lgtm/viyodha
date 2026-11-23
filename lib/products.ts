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
  price100g: number;
  price200g: number;
  mrp?: number;
  desc: string;
  details: { label: string; value: string }[];
};

export const PRODUCTS: Product[] = [
  {
    slug: "green-cardamom",
    name: "Green Cardamom (ഏലക്ക)",
    img: "/products/cardamom.png",
    img2: "/products/cardamom2.png",
    images: ["/products/cardamom.png", "/products/cardamom2.png"],
    price: 499,
    price100g: 499,
    price200g: 899,
    desc: "Plump, aromatic pods graded by size and sealed fresh. Use whole in tea, biryani and desserts, or crush the seeds just before cooking.",
    details: [
      { label: "Malayalam name", value: "ഏലക്ക (Elakka)" },
      { label: "Grade", value: "8mm+" },
      { label: "Origin", value: "Idukki, Kerala" },
      { label: "Available sizes", value: "100 g, 200 g" },
      { label: "Form", value: "Whole pods" },
    ],
  },
  {
    slug: "black-pepper",
    name: "Black Pepper (കുരുമുളക്)",
    img: "/products/black_pepper.png",
    img2: "/products/black_pepper2.png",
    images: ["/products/black_pepper.png", "/products/black_pepper2.png"],
    price: 99,
    price100g: 99,
    price200g: 189,
    desc: "Bold, sharp peppercorns with a strong aroma. Grind fresh over any dish for a warmth that pre-ground pepper cannot match.",
    details: [
      { label: "Malayalam name", value: "കുരുമുളക് (Kurumulaku)" },
      { label: "Grade", value: "Bold" },
      { label: "Origin", value: "Kerala" },
      { label: "Available sizes", value: "100 g, 200 g" },
      { label: "Form", value: "Whole" },
    ],
  },
  {
    slug: "nutmeg",
    name: "Nutmeg (ജാതിക്ക)",
    img: "/products/nutmeg.png",
    img2: "/products/nutmeg2.png",
    images: ["/products/nutmeg.png", "/products/nutmeg2.png"],
    price: 299,
    price100g: 299,
    price200g: 589,
    desc: "Whole nutmeg, slow-dried so it keeps its oils. Grate a little into sauces, milk drinks, baking and curries.",
    details: [
      { label: "Malayalam name", value: "ജാതിക്ക (Jathikka)" },
      { label: "Grade", value: "Whole" },
      { label: "Origin", value: "Kerala" },
      { label: "Available sizes", value: "100 g, 200 g" },
      { label: "Form", value: "Whole" },
    ],
  },
  {
    slug: "bay-leaf",
    name: "Bay Leaf (വഴനയില)",
    img: "/products/bay_leaf.png",
    img2: "/products/bay_leaf2.png",
    images: ["/products/bay_leaf.png", "/products/bay_leaf2.png"],
    price: 49,
    price100g: 49,
    price200g: 189,
    desc: "Whole leaves, dried gently to keep their colour and aroma. Add to rice, dals, stews and stocks.",
    details: [
      { label: "Malayalam name", value: "വഴനയില (Vazhanayila)" },
      { label: "Grade", value: "Hand-picked" },
      { label: "Origin", value: "Kerala" },
      { label: "Available sizes", value: "100 g, 200 g" },
      { label: "Form", value: "Whole leaves" },
    ],
  },
  {
    slug: "cinnamon",
    name: "Cinnamon (കറുവപ്പട്ട)",
    img: "/products/cinnamon.png",
    img2: "/products/cinnamon2.png",
    images: ["/products/cinnamon.png", "/products/cinnamon2.png"],
    price: 59,
    price100g: 59,
    price200g: 119,
    desc: "Cinnamon with a bold, warm flavour and a sweet finish. Simmer the sticks in tea, curries, biryani and desserts.",
    details: [
      { label: "Malayalam name", value: "കറുവപ്പട്ട (Karuvapatta)" },
      { label: "Type", value: "Cinnamon" },
      { label: "Origin", value: "Kerala" },
      { label: "Available sizes", value: "100 g, 200 g" },
      { label: "Form", value: "Sticks" },
    ],
  },
  {
    slug: "cassia-cinnamon",
    name: "Cassia Cinnamon (ചുരുൾ പട്ട)",
    img: "/products/cassia_cinnamon.png",
    img2: "/products/cinnamon2.png",
    images: ["/products/cassia_cinnamon.png", "/products/cinnamon2.png"],
    price: 99,
    price100g: 99,
    price200g: 189,
    desc: "Cassia cinnamon with a bold, warm flavour and a sweet finish. Simmer the sticks in tea, curries, biryani and desserts.",
    details: [
      { label: "Malayalam name", value: "ചുരുൾ പട്ട (Churul patta)" },
      { label: "Type", value: "Cassia" },
      { label: "Origin", value: "Kerala" },
      { label: "Available sizes", value: "100 g, 200 g" },
      { label: "Form", value: "Sticks" },
    ],
  },
  {
    slug: "star-anise",
    name: "Star Anise (തക്കോലം)",
    img: "/products/star_anise.jpeg",
    img2: "/products/star_anise2.png",
    images: ["/products/star_anise.jpeg", "/products/star_anise2.png"],
    price: 99,
    price100g: 99,
    price200g: 189,
    desc: "Whole, star-shaped pods with a sweet, licorice-like aroma. Add to biryani, masala chai, stocks and slow-cooked curries.",
    details: [
      { label: "Malayalam name", value: "തക്കോലം (Thakkolam)" },
      { label: "Grade", value: "Whole stars" },
      { label: "Origin", value: "Kerala" },
      { label: "Available sizes", value: "100 g, 200 g" },
      { label: "Form", value: "Whole" },
    ],
  },
  {
    slug: "mace",
    name: "Mace (ജാതിപത്രി)",
    img: "/products/mace.png",
    img2: "/products/mace2.png",
    images: ["/products/mace.png", "/products/mace2.png"],
    price: 299,
    price100g: 299,
    price200g: 589,
    desc: "Delicate blades of mace with a warm, floral flavour milder than nutmeg. Use in rich gravies, biryani, baking and spice blends.",
    details: [
      { label: "Malayalam name", value: "ജാതിപത്രി (Jathipathri)" },
      { label: "Grade", value: "Whole blades" },
      { label: "Origin", value: "Kerala" },
      { label: "Available sizes", value: "100 g, 200 g" },
      { label: "Form", value: "Whole" },
    ],
  },
  {
    slug: "cloves",
    name: "Cloves (ഗ്രാമ്പൂ)",
    img: "/products/cloves.png",
    img2: "/products/cloves2.png",
    images: ["/products/cloves.png", "/products/cloves2.png"],
    price: 149,
    price100g: 149,
    price200g: 289,
    desc: "Plump, intensely aromatic cloves with a strong, warming flavour. Use in rice dishes, curries, teas and pickles, a few at a time.",
    details: [
      { label: "Malayalam name", value: "ഗ്രാമ്പൂ (Gramboo)" },
      { label: "Grade", value: "Hand-picked" },
      { label: "Origin", value: "Kerala" },
      { label: "Available sizes", value: "100 g, 200 g" },
      { label: "Form", value: "Whole" },
    ],
  },
];

export const discountOf = (_p?: Product) => 0;
