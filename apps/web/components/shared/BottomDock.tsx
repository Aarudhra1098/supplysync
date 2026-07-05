"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import {
  AnimatePresence,
  type MotionValue,
  motion,
  type SpringOptions,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  Children,
  cloneElement,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// ─── Dock animation engine ───────────────────────────────────────────────────

const DOCK_HEIGHT = 128;
const DEFAULT_MAGNIFICATION = 70;
const DEFAULT_DISTANCE = 140;
const DEFAULT_PANEL_HEIGHT = 58;

interface DocContextType {
  mouseX: MotionValue;
  spring: SpringOptions;
  magnification: number;
  distance: number;
}

const DockContext = createContext<DocContextType | undefined>(undefined);

function useDock() {
  const context = useContext(DockContext);
  if (!context) throw new Error("useDock must be used within a DockProvider");
  return context;
}

function AnimatedDock({
  children,
  className,
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = DEFAULT_MAGNIFICATION,
  distance = DEFAULT_DISTANCE,
  panelHeight = DEFAULT_PANEL_HEIGHT,
}: {
  children: React.ReactNode;
  className?: string;
  spring?: SpringOptions;
  magnification?: number;
  distance?: number;
  panelHeight?: number;
}) {
  const mouseX = useMotionValue(Number.POSITIVE_INFINITY);
  const isHovered = useMotionValue(0);

  const maxHeight = useMemo(
    () => Math.max(DOCK_HEIGHT, magnification + magnification / 2 + 4),
    [magnification]
  );

  const heightRow = useTransform(isHovered, [0, 1], [panelHeight, maxHeight]);
  const height = useSpring(heightRow, spring);

  return (
    <motion.div
      className="mx-2 flex max-w-full items-end overflow-x-auto"
      style={{ height, scrollbarWidth: "none" }}
    >
      <motion.div
        aria-label="Application dock"
        className={cn(
          "mx-auto flex w-fit items-center gap-3 rounded-full bg-white/90 backdrop-blur-xl px-3 shadow-dock",
          className
        )}
        onMouseLeave={() => {
          isHovered.set(0);
          mouseX.set(Number.POSITIVE_INFINITY);
        }}
        onMouseMove={({ pageX }) => {
          isHovered.set(1);
          mouseX.set(pageX);
        }}
        role="toolbar"
        style={{ height: panelHeight }}
      >
        <DockContext.Provider value={{ mouseX, spring, distance, magnification }}>
          {children}
        </DockContext.Provider>
      </motion.div>
    </motion.div>
  );
}

function DockItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { distance, magnification, mouseX, spring } = useDock();
  const isHovered = useMotionValue(0);

  const mouseDistance = useTransform(mouseX, (val) => {
    const domRect = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - domRect.x - domRect.width / 2;
  });

  const widthTransform = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [40, magnification, 40]
  );

  const width = useSpring(widthTransform, spring);

  return (
    <motion.div
      className={cn("relative inline-flex items-center justify-center", className)}
      onBlur={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onHoverStart={() => isHovered.set(1)}
      ref={ref}
      style={{ width }}
      tabIndex={0}
    >
      {Children.map(children, (child) =>
        cloneElement(child as React.ReactElement<any>, { width, isHovered })
      )}
    </motion.div>
  );
}

function DockLabel({
  children,
  className,
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const restProps = rest as Record<string, unknown>;
  const isHovered = restProps.isHovered as MotionValue<number>;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isHovered) return;
    const unsub = isHovered.on("change", (latest) => setIsVisible(latest === 1));
    return () => unsub();
  }, [isHovered]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          animate={{ opacity: 1, y: -10 }}
          className={cn(
            "absolute -top-6 left-1/2 w-fit whitespace-pre rounded-md bg-gray-800 px-2 py-0.5 text-[10px] font-semibold text-white shadow-lg",
            className
          )}
          exit={{ opacity: 0, y: 0 }}
          initial={{ opacity: 0, y: 0 }}
          role="tooltip"
          style={{ x: "-50%" }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DockIcon({
  children,
  className,
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const restProps = rest as Record<string, unknown>;
  const width = restProps.width as MotionValue<number>;

  const widthTransform = useTransform(width, (val) => val / 2);

  return (
    <motion.div
      className={cn("flex items-center justify-center", className)}
      style={{ width: widthTransform }}
    >
      {children}
    </motion.div>
  );
}

// ─── SupplySync BottomDock (public API) ──────────────────────────────────────

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

interface BottomDockProps {
  items: NavItem[];
  accentColor?: "buyer" | "supplier";
}

export default function BottomDock({ items, accentColor = "buyer" }: BottomDockProps) {
  const pathname = usePathname();
  const { itemCount } = useCart();

  const accentTextClass = accentColor === "buyer" ? "text-buyer" : "text-supplier";
  const accentBgClass = accentColor === "buyer" ? "bg-buyer" : "bg-supplier";

  return (
    <nav
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
      id="bottom-dock-nav"
      style={{ minWidth: 340, maxWidth: 520, width: "90%" }}
    >
      <AnimatedDock>
        {items.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          const badgeCount = item.name === "Cart" ? itemCount : item.badge;

          return (
            <DockItem key={item.href}>
              <DockLabel>{item.name}</DockLabel>
              <DockIcon>
                <Link
                  href={item.href}
                  className={cn(
                    "relative flex items-center justify-center w-full h-full rounded-full transition-colors duration-200",
                    isActive ? accentTextClass : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  <Icon className="size-full" />

                  {/* Active indicator dot */}
                  {isActive && (
                    <motion.span
                      layoutId="dock-active-dot"
                      className={cn("absolute -bottom-1.5 w-1 h-1 rounded-full", accentBgClass)}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />
                  )}

                  {/* Cart badge */}
                  {badgeCount !== undefined && badgeCount > 0 && (
                    <motion.span
                      key={badgeCount}
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center leading-none"
                    >
                      {badgeCount > 9 ? "9+" : badgeCount}
                    </motion.span>
                  )}
                </Link>
              </DockIcon>
            </DockItem>
          );
        })}
      </AnimatedDock>
    </nav>
  );
}
