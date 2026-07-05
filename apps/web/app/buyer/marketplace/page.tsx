"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import { fetchApi } from "@/lib/api-client";
import ProductBlock from "@/components/shared/ProductBlock";
import FilterDrawer from "@/components/shared/FilterDrawer";
import SkeletonLoader from "@/components/shared/SkeletonLoader";
import EmptyState from "@/components/shared/EmptyState";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, Package } from "lucide-react";

interface Listing {
  id: string;
  supplier_id: string;
  supplier_name: string;
  supplier_city?: string;
  material_name: string;
  category: string | null;
  stock_qty: number;
  unit: string;
  price_per_unit: number;
  image_url?: string;
  is_flagged_high: boolean;
}

export default function MarketplacePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [appliedFilters, setAppliedFilters] = useState({ category: "", city: "", priceRange: [0, 10000] as [number, number] });
  const { addItem } = useCart();
  const { showToast } = useToast();

  const loadListings = useCallback(async () => {
    try {
      const data = await fetchApi<Listing[]>("/listings/browse", {
        cache: "no-store",
      });
      setListings(data);
    } catch (err: any) {
      console.error("Failed to load listings:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  const allCategories = useMemo(() => {
    return Array.from(new Set(listings.map(l => l.category).filter(Boolean))) as string[];
  }, [listings]);

  const allCities = useMemo(() => {
    return Array.from(new Set(listings.map(l => l.supplier_city).filter(Boolean))) as string[];
  }, [listings]);

  // Filter results
  const filteredListings = useMemo(() => {
    return listings.filter(listing => {
      const matchesSearch = !searchQuery || listing.material_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !appliedFilters.category || listing.category === appliedFilters.category;
      const matchesCity = !appliedFilters.city || listing.supplier_city === appliedFilters.city;
      const matchesPrice = Number(listing.price_per_unit) >= appliedFilters.priceRange[0] && Number(listing.price_per_unit) <= appliedFilters.priceRange[1];
      return matchesSearch && matchesCategory && matchesCity && matchesPrice;
    });
  }, [listings, searchQuery, appliedFilters]);

  const handleAddToCart = (listing: Listing, quantity: number) => {
    addItem({
      listingId: listing.id,
      materialName: listing.material_name,
      supplierName: listing.supplier_name,
      supplierId: listing.supplier_id,
      unitPrice: Number(listing.price_per_unit),
      unit: listing.unit,
      availableStock: Number(listing.stock_qty),
      quantity,
    });
    showToast(`${quantity} ${listing.unit} of ${listing.material_name} added to cart`, "success");
  };

  const handleApplyFilters = () => {
    setAppliedFilters({ category: selectedCategory, city: selectedCity, priceRange });
  };

  const handleClearFilters = () => {
    setSelectedCategory("");
    setSelectedCity("");
    setPriceRange([0, 10000]);
    setAppliedFilters({ category: "", city: "", priceRange: [0, 10000] });
  };

  if (isLoading) {
    return (
      <div id="buyer-marketplace">
        <div className="flex items-center gap-3 mb-6">
          <div className="search-bar flex-1">
            <Search className="w-5 h-5 text-subtle shrink-0" />
            <input type="text" placeholder="Search materials..." disabled />
          </div>
        </div>
        <SkeletonLoader count={8} type="card" />
      </div>
    );
  }

  return (
    <div id="buyer-marketplace">
      {/* Search + Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6"
      >
        <div className="search-bar flex-1">
          <Search className="w-5 h-5 text-subtle shrink-0" />
          <input
            type="text"
            placeholder="Search materials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            id="marketplace-search"
          />
        </div>
        <button
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white border border-gray-100 shadow-card text-body text-sm font-medium hover:bg-gray-50 transition-colors"
          id="filter-btn"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filter
        </button>
      </motion.div>

      {/* Results Grid */}
      {filteredListings.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products available"
          description={listings.length === 0 ? "No suppliers have listed products yet. Check back soon!" : "Try adjusting your search or filters to find what you're looking for."}
          actionLabel={listings.length > 0 ? "Clear Filters" : undefined}
          onAction={listings.length > 0 ? handleClearFilters : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredListings.map((listing, i) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <ProductBlock
                id={listing.id}
                materialName={listing.material_name}
                supplierName={listing.supplier_name}
                supplierCity={listing.supplier_city}
                stockQty={Number(listing.stock_qty)}
                unit={listing.unit}
                pricePerUnit={Number(listing.price_per_unit)}
                imageUrl={listing.image_url}
                onAddToCart={(qty) => handleAddToCart(listing, qty)}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        categories={allCategories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        cities={allCities}
        selectedCity={selectedCity}
        onCityChange={setSelectedCity}
        priceRange={priceRange}
        onPriceRangeChange={setPriceRange}
        maxPrice={10000}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />
    </div>
  );
}
