import React, { useEffect, useRef, useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

export default function ScrollShadow({
    children,
    className = "",
    parentClass,
    shadowColor = "#000",
    icon = true,
}) {
    const scrollRef = useRef(null);
    const [shadows, setShadows] = useState({ top: false, bottom: false });

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const update = () => {
            const { scrollTop, scrollHeight, clientHeight } = el;
            setShadows({
                top: scrollTop > 0,
                bottom: scrollTop + clientHeight + 1 < scrollHeight,
            });
        };

        update(); // initial

        el.addEventListener("scroll", update);
        window.addEventListener("resize", update);

        return () => {
            el.removeEventListener("scroll", update);
            window.removeEventListener("resize", update);
        };
    }, []);

    // Scroll amount in pixels
    const SCROLL_AMOUNT = 80;

    // Scroll up function
    const scrollUp = () => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollBy({ top: -SCROLL_AMOUNT, behavior: "smooth" });
    };

    // Scroll down function
    const scrollDown = () => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollBy({ top: SCROLL_AMOUNT, behavior: "smooth" });
    };

    return (
        <div className={"relative overflow-hidden h-full" + parentClass}>
            {shadows.top && (
                <div
                    onClick={scrollUp}
                    className="absolute top-0 left-0 right-0 h-6 z-10 cursor-pointer flex items-start justify-center"
                    style={{
                        background: `linear-gradient(to bottom, ${shadowColor}, transparent)`,
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && scrollUp()}
                >
                    {icon && (
                        <ChevronUp
                            size={16}
                            color="white"
                            className="mt-0.5 bg-transparent"
                            style={{ opacity: 1 }}
                        />
                    )}
                </div>
            )}

            {shadows.bottom && (
                <div
                    onClick={scrollDown}
                    className="absolute bottom-0 left-0 right-0 h-6 z-10 cursor-pointer flex items-end justify-center"
                    style={{
                        background: `linear-gradient(to top, ${shadowColor}, transparent)`,
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && scrollDown()}
                >
                    {icon && (
                        <ChevronDown
                            size={16}
                            className="mb-0.5 bg-transparent"
                            color="white"
                            style={{ opacity: 1 }}
                        />
                    )}
                </div>
            )}

            <div
                ref={scrollRef}
                className={`${className} h-full overflow-y-auto no-scrollbar`}
            >
                {children}
            </div>
        </div>
    );
}