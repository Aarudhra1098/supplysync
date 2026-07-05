"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/lib/toast-context";
import { fetchApi } from "@/lib/api-client";
import { formatINR } from "@/lib/format";
import ElevatedCard from "@/components/shared/ElevatedCard";
import StatusPill from "@/components/shared/StatusPill";
import EmptyState from "@/components/shared/EmptyState";
import SkeletonLoader from "@/components/shared/SkeletonLoader";
import { motion } from "framer-motion";
import { ClipboardList, Loader2 } from "lucide-react";

interface IncomingOrder {
  id: string;
  quantity: number;
  total_price: number;
  status: "pending" | "confirmed" | "in_transit" | "delivered";
  created_at: string;
  listings: {
    material_name: string;
    unit: string;
  };
  users_buyer: {
    display_name: string | null;
    business_name: string | null;
  };
}

const nextStatusMap: Record<string, { next: string; label: string }> = {
  pending: { next: "confirmed", label: "Confirm" },
  confirmed: { next: "in_transit", label: "Mark In Transit" },
  in_transit: { next: "delivered", label: "Mark Delivered" },
};

export default function SupplierOrdersIncomingPage() {
  const [orders, setOrders] = useState<IncomingOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const { showToast } = useToast();

  const loadOrders = useCallback(async () => {
    try {
      const data = await fetchApi<IncomingOrder[]>("/orders/mine");
      // Only show active orders (not delivered/cancelled)
      setOrders(data.filter(o => ["pending", "confirmed", "in_transit"].includes(o.status)));
    } catch (err: any) {
      showToast(err.message || "Failed to load orders", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const getBuyerName = (order: IncomingOrder) =>
    order.users_buyer?.business_name || order.users_buyer?.display_name || "Unknown Buyer";

  const handleStatusUpdate = async (orderId: string, nextStatus: string) => {
    setLoadingId(orderId);
    try {
      await fetchApi(`/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });
      if (nextStatus === "delivered") {
        setOrders(prev => prev.filter(o => o.id !== orderId));
      } else {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus as any } : o));
      }
      showToast(`Order updated to ${nextStatus.replace("_", " ")}`, "success");
    } catch (err: any) {
      showToast(err.message || "Failed to update order", "error");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div id="supplier-orders-incoming">
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-jakarta font-bold text-heading text-2xl mb-6"
      >
        Incoming Orders
      </motion.h1>

      {isLoading ? (
        <SkeletonLoader count={3} type="row" />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No incoming orders"
          description="Orders will appear here when buyers purchase your listings."
        />
      ) : (
        <div className="space-y-3">
          {orders.map((order, i) => {
            const transition = nextStatusMap[order.status];
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <ElevatedCard>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-supplier-soft flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-supplier">{getBuyerName(order).charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-heading text-sm truncate">{order.listings.material_name}</p>
                      <p className="text-subtle text-xs">
                        {getBuyerName(order)} · {order.quantity} {order.listings.unit} · {new Date(order.created_at).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="price-tag text-sm text-heading">{formatINR(Number(order.total_price))}</p>
                      <StatusPill status={order.status} />
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {transition && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, transition.next)}
                          disabled={loadingId === order.id}
                          className="btn-primary-supplier text-xs py-2 px-3 flex items-center gap-1"
                        >
                          {loadingId === order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : transition.label}
                        </button>
                      )}
                    </div>
                  </div>
                </ElevatedCard>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
