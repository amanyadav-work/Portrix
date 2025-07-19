'use client'
import React, { useEffect, useRef, useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ScrollShadow({
  children,
  className = "",
  parentClass,
  shadowColor = "#1A1F2350",
  icon = true,
  direction = "vertical", // "vertical", "horizontal", or "both"
}) {
  const scrollRef = useRef(null);
  const [shadows, setShadows] = useState({
    top: false,
    bottom: false,
    left: false,
    right: false,
  });

  const SCROLL_AMOUNT = 80;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const update = () => {
      const { scrollTop, scrollHeight, clientHeight, scrollLeft, scrollWidth, clientWidth } = el;
      setShadows({
        top: scrollTop > 0,
        bottom: scrollTop + clientHeight + 1 < scrollHeight,
        left: scrollLeft > 0,
        right: scrollLeft + clientWidth + 1 < scrollWidth,
      });
    };

    update(); // Initial call
    el.addEventListener("scroll", update);
    window.addEventListener("resize", update);

    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const scroll = (axis, amount) => {
    if (!scrollRef.current) return;
    if (axis === "vertical") {
      scrollRef.current.scrollBy({ top: amount, behavior: "smooth" });
    } else if (axis === "horizontal") {
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  return (
    <div className={cn("relative overflow-hidden h-full w-full", parentClass)}>
      {/* Vertical Shadows */}
      {(direction === "vertical" || direction === "both") && shadows.top && (
        <div
          onClick={() => scroll("vertical", -SCROLL_AMOUNT)}
          className="absolute top-0 left-0 right-0 h-6 z-10 cursor-pointer flex justify-center items-center"
          style={{
            background: `linear-gradient(to bottom, ${shadowColor}, transparent)`,
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) =>
            e.key === "Enter" && scroll("vertical", -SCROLL_AMOUNT)
          }
        >
          {icon && <ChevronUp size={16} />}
        </div>
      )}

      {(direction === "vertical" || direction === "both") && shadows.bottom && (
        <div
          onClick={() => scroll("vertical", SCROLL_AMOUNT)}
          className="absolute bottom-0 left-0 right-0 h-6 z-10 cursor-pointer flex justify-center items-center"
          style={{
            background: `linear-gradient(to top, ${shadowColor}, transparent)`,
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) =>
            e.key === "Enter" && scroll("vertical", SCROLL_AMOUNT)
          }
        >
          {icon && <ChevronDown size={16} />}
        </div>
      )}

      {/* Horizontal Shadows */}
      {(direction === "horizontal" || direction === "both") && shadows.left && (
        <div
          onClick={() => scroll("horizontal", -SCROLL_AMOUNT)}
          className="absolute top-0 bottom-0 left-0 w-6 z-10 cursor-pointer flex justify-center items-center"
          style={{
            background: `linear-gradient(to right, ${shadowColor}, transparent)`,
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) =>
            e.key === "Enter" && scroll("horizontal", -SCROLL_AMOUNT)
          }
        >
          {icon && <ChevronLeft size={16} />}
        </div>
      )}

      {(direction === "horizontal" || direction === "both") && shadows.right && (
        <div
          onClick={() => scroll("horizontal", SCROLL_AMOUNT)}
          className="absolute top-0 bottom-0 right-0 w-6 z-10 cursor-pointer flex justify-center items-center"
          style={{
            background: `linear-gradient(to left, ${shadowColor}, transparent)`,
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) =>
            e.key === "Enter" && scroll("horizontal", SCROLL_AMOUNT)
          }
        >
          {icon && <ChevronRight size={16} />}
        </div>
      )}

      {/* Scrollable Content */}
      <div
        ref={scrollRef}
        className={cn(
          className,
          direction === "vertical"
            ? "h-full overflow-y-auto"
            : direction === "horizontal"
            ? "w-full overflow-x-auto"
            : "h-full w-full overflow-auto", // both
          "no-scrollbar"
        )}
      >
        {children}
      </div>
    </div>
  );
}