"use client";

import { formatINR } from "@/lib/format";
import { ShoppingCart, Check, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ProductBlockProps {
  id: string;
  materialName: string;
  supplierName: string;
  supplierCity?: string;
  stockQty: number;
  unit: string;
  pricePerUnit: number;
  imageUrl?: string;
  onAddToCart: (quantity: number) => void;
}

export default function ProductBlock({
  id,
  materialName,
  supplierName,
  supplierCity,
  stockQty,
  unit,
  pricePerUnit,
  imageUrl,
  onAddToCart,
}: ProductBlockProps) {
  const [justAdded, setJustAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const isOutOfStock = stockQty <= 0;
  const isLowStock = stockQty > 0 && stockQty <= 20;

  const handleAdd = () => {
    if (isOutOfStock) return;
    onAddToCart(quantity);
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
      setQuantity(1);
    }, 1500);
  };

  const incrementQty = () => setQuantity(q => Math.min(q + 1, stockQty));
  const decrementQty = () => setQuantity(q => Math.max(q - 1, 1));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`elevated-card overflow-hidden flex flex-col ${isOutOfStock ? "opacity-60" : ""}`}
      id={`product-${id}`}
    >
      {/* Image / Placeholder */}
      <div className="relative h-40 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        {imageUrl ? (
          <img src={imageUrl} alt={materialName} className="h-full w-full object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center">
            <span className="text-2xl font-bold text-muted">{materialName.charAt(0)}</span>
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-jakarta font-semibold text-heading text-[15px] leading-tight mb-1">{materialName}</h3>
        <p className="text-subtle text-xs mb-1">{supplierName}</p>
        {supplierCity && (
          <p className="text-subtle text-xs mb-2">📍 {supplierCity}</p>
        )}

        {/* Stock info */}
        <div className="mb-3">
          {isOutOfStock ? (
            <span className="text-red-500 text-xs font-medium">Unavailable</span>
          ) : isLowStock ? (
            <span className="text-amber-600 text-xs font-medium">Only {stockQty} {unit} left</span>
          ) : (
            <span className="text-muted text-xs">In Stock: {stockQty.toLocaleString("en-IN")} {unit}</span>
          )}
        </div>

        {/* Price */}
        <div className="mb-3">
          <span className="price-tag text-xl text-buyer font-bold">{formatINR(pricePerUnit)}</span>
          <span className="text-subtle text-xs ml-1">/{unit}</span>
        </div>

        {/* Quantity Selector — Slider + Stepper */}
        {!isOutOfStock && !justAdded && (
          <div className="mb-3 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted uppercase tracking-wider">Qty</label>
              <span className="text-xs text-muted tabular-nums">
                Total: <span className="font-semibold text-heading">{formatINR(pricePerUnit * quantity)}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={decrementQty}
                disabled={quantity <= 1}
                className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-body hover:bg-gray-200 disabled:opacity-30 transition-colors"
              >
                <Minus className="w-3 h-3" />
              </button>
              <input
                type="range"
                min={1}
                max={stockQty}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="flex-1 accent-buyer h-1.5"
                id={`qty-slider-${id}`}
              />
              <button
                onClick={incrementQty}
                disabled={quantity >= stockQty}
                className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-body hover:bg-gray-200 disabled:opacity-30 transition-colors"
              >
                <Plus className="w-3 h-3" />
              </button>
              <span className="w-12 text-center font-semibold text-heading tabular-nums text-sm bg-gray-50 rounded-lg py-1">
                {quantity}
              </span>
            </div>
          </div>
        )}

        {/* Add to Cart */}
        <AnimatePresence mode="wait">
          {!isOutOfStock && (
            <motion.button
              key={justAdded ? "added" : "add"}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={handleAdd}
              disabled={justAdded}
              className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
                justAdded
                  ? "bg-green-50 text-green-600 border border-green-200"
                  : "btn-primary-buyer"
              }`}
              id={`add-to-cart-${id}`}
            >
              {justAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  Added {quantity} {unit} ✓
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  Add {quantity} {unit} to Cart
                </>
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
