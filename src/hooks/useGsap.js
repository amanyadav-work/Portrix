// hooks/useGsap.js
import { useEffect } from "react"
import gsap from "gsap"

/**
 * useGsap
 * @param {gsap.TweenTarget} targets - The element(s) to animate (ref.current or array of refs).
 * @param {string} type - Animation type: 'fade-in', 'stagger-fade', 'slide-up', 'custom'.
 * @param {object} options - Custom options like duration, delay, ease, etc.
 */
export function useGsap(targets, type, options = {}) {
  const {
    duration = 0.6,
    delay = 0,
    stagger = 0.1,
    ease = "power2.out",
    customAnimation,
  } = options

  useEffect(() => {
    if (!targets) return

    switch (type) {
      case "fade-in":
        gsap.fromTo(
          targets,
          { opacity: 0 },
          { opacity: 1, duration, delay, ease }
        )
        break

      case "stagger-fade":
        gsap.fromTo(
          targets,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration, stagger, delay, ease }
        )
        break

      case "slide-up":
        gsap.fromTo(
          targets,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration, delay, ease }
        )
        break

      case "custom":
        if (typeof customAnimation === "function") {
          customAnimation(targets)
        }
        break

      default:
        console.warn(`GSAP: Unknown animation type "${type}"`)
        break
    }
  }, [targets])
}
