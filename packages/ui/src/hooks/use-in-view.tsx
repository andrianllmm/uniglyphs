import { useEffect, useState, RefObject } from "react";

export function useInView(
  target: RefObject<HTMLElement | null>,
  options: IntersectionObserverInit,
) {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const node = target.current;
    if (!node) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry?.isIntersecting ?? false);
    }, options);

    observer.observe(node);

    return () => observer.disconnect();
  }, [target, options]);

  return isIntersecting;
}
