import { useEffect, useState } from "react";

export const useAnimatedCounter = (end, duration = 1500, enabled = true) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setCount(end);
      return;
    }
    let start = 0;
    const startTime = performance.now();
    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [end, duration, enabled]);

  return count;
};
