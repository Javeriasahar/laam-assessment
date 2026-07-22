import { products } from "@/data/seed";
import { notFound } from "next/navigation";
import { ProductClient } from "./ProductClient";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = products.find((p) => p.id === id);
  if (!product) notFound();

  return (
    <main className="min-h-screen" style={{ background: "var(--ivory)" }}>
      <ProductClient product={product} />
    </main>
  );
}

export async function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}
