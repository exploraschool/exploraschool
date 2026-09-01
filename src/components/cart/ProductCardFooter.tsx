"use client";

import { AddToCartButton } from "@/components/cart/AddToCartButton";
import type { ProductId } from "@/data/products";

type ProductCardFooterProps = {
  productId: ProductId;
  className?: string;
};

export function ProductCardFooter({ productId, className = "mt-4 !w-full" }: ProductCardFooterProps) {
  return <AddToCartButton productId={productId} className={className} />;
}
