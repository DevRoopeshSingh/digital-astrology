import type { NextApiRequest, NextApiResponse } from "next";

const FALLBACK_PRODUCTS = [
  {
    sku: "GEM-NEELAM-01",
    name: "Premium Neelam",
    category: "Gemstone",
    certification: "IGI Certified",
    price: 34999,
    currency: "INR",
    image:
      "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=400&q=80",
    stock: "In Stock"
  },
  {
    sku: "YAN-SHREE-02",
    name: "Gold Plated Shree Yantra",
    category: "Yantra",
    certification: "Temple Energised",
    price: 5499,
    currency: "INR",
    image:
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80",
    stock: "Low Stock"
  },
  {
    sku: "KIT-LAKSHMI-01",
    name: "Mahalakshmi Puja Kit",
    category: "Puja Kit",
    certification: "Pandit Curated",
    price: 3299,
    currency: "INR",
    image:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80",
    stock: "In Stock"
  },
  {
    sku: "BOOK-VASTU-01",
    name: "Advanced Vastu Shastra",
    category: "Book",
    certification: "Bestseller",
    price: 899,
    currency: "INR",
    image:
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=400&q=80",
    stock: "Preorder"
  }
];

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  const baseUrl = process.env.COMMERCE_SERVICE_URL
    ? process.env.COMMERCE_SERVICE_URL.replace(/\/$/, "")
    : undefined;

  if (baseUrl) {
    try {
      const response = await fetch(`${baseUrl}/products`);
      if (response.ok) {
        const payload = await response.json();
        if (Array.isArray(payload)) {
          return res.status(200).json(payload);
        }
        if (payload?.products) {
          return res.status(200).json(payload.products);
        }
      }
      // eslint-disable-next-line no-console
      console.warn("commerce service responded with status", response.status);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn("commerce service unavailable, using fallback", error);
    }
  }

  return res.status(200).json(FALLBACK_PRODUCTS);
}
