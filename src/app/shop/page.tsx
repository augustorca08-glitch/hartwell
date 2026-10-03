import type { Metadata } from "next";
import { products } from "@/content/products";
import { ShopView } from "@/components/shop/shop-view";
import { pickFilters } from "@/lib/filters";

export const metadata: Metadata = {
  title: "Shop",
  description: "Camisas, polos, punto, pantalones, abrigos y accesorios HARTWELL.",
};

export default async function ShopPage({ searchParams }: PageProps<"/shop">) {
  return <ShopView items={products} initial={pickFilters(await searchParams)} />;
}
