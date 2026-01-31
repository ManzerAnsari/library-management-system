import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Returns a value that updates only after `value` has not changed for `delay` ms.
 * Useful for debouncing search input before triggering API calls.
 *
 * @param {T} value - The value to debounce
 * @param {number} delay - Delay in milliseconds (default 300)
 * @returns {T} - The debounced value
 */
export function useDebouncedValue(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Returns a stable callback that invokes `fn` only after it has not been
 * called again for `delay` ms. Useful for debouncing event handlers (e.g. onChange).
 *
 * @param {(...args: any[]) => void} fn - The function to debounce
 * @param {number} delay - Delay in milliseconds (default 300)
 * @returns {(...args: any[]) => void} - Debounced function
 */
export function useDebouncedCallback(fn, delay = 300) {
  const fnRef = useRef(fn);
  const timerRef = useRef(null);
  fnRef.current = fn;

  const debouncedFn = useCallback(
    (...args) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        fnRef.current(...args);
        timerRef.current = null;
      }, delay);
    },
    [delay]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return debouncedFn;
}
