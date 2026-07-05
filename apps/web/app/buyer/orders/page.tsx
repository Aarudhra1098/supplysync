"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchApi } from "@/lib/api-client";
import { formatINR } from "@/lib/format";
import ElevatedCard from "@/components/shared/ElevatedCard";
import StatusPill from "@/components/shared/StatusPill";
import EmptyState from "@/components/shared/EmptyState";
import SkeletonLoader from "@/components/shared/SkeletonLoader";
import { motion } from "framer-motion";
import Link from "next/link";
import { ShoppingBag, Eye } from "lucide-react";

interface Order {
  id: string;
  quantity: number;
  total_price: number;
  status: "pending" | "confirmed" | "in_transit" | "delivered" | "cancelled";
  created_at: string;
  listings: {
    material_name: string;
    unit: string;
  };
  users_supplier: {
    display_name: string | null;
    business_name: string | null;
  };
}

const statusTabs = ["all", "pending", "confirmed", "in_transit", "delivered", "cancelled"] as const;
const tabLabels: Record<string, string> = {
  all: "All",
  pending: "Pending",
  confirmed: "Confirmed",
  in_transit: "In Transit",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function BuyerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");

  const loadOrders = useCallback(async () => {
    try {
      const data = await fetchApi<Order[]>("/orders/mine");
      setOrders(data);
    } catch (err: any) {
      console.error("Failed to load orders:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = activeTab === "all"
    ? orders
    : orders.filter(o => o.status === activeTab);

  const getSupplierName = (order: Order) =>
    order.users_supplier?.business_name || order.users_supplier?.display_name || "Unknown Supplier";

  return (
    <div id="buyer-orders">
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-jakarta font-bold text-heading text-2xl mb-6"
      >
        Order History
      </motion.h1>

      {/* Status Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {statusTabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab
                ? "bg-buyer text-white shadow-btn"
                : "bg-white text-muted border border-gray-100 hover:bg-gray-50"
            }`}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {isLoading ? (
        <SkeletonLoader count={4} type="row" />
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title={`No ${activeTab === "all" ? "" : tabLabels[activeTab].toLowerCase() + " "}orders`}
          description={orders.length === 0 ? "Place your first order from the marketplace!" : "Orders matching this filter will appear here."}
          actionLabel={orders.length === 0 ? "Browse Marketplace" : undefined}
          actionHref={orders.length === 0 ? "/buyer/marketplace" : undefined}
        />
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <ElevatedCard className="hover:shadow-card-hover transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-muted">{order.listings.material_name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-heading text-sm truncate">{order.listings.material_name}</p>
                    <p className="text-subtle text-xs">
                      {getSupplierName(order)} · Qty: {order.quantity} · {new Date(order.created_at).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <div className="text-right shrink-0 flex items-center gap-3">
                    <div>
                      <p className="price-tag text-sm text-heading">{formatINR(Number(order.total_price))}</p>
                      <StatusPill status={order.status} />
                    </div>
                    <Link
                      href={`/buyer/order-tracking/${order.id}`}
                      className="p-2 rounded-lg bg-gray-50 hover:bg-buyer-soft text-muted hover:text-buyer transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </ElevatedCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
