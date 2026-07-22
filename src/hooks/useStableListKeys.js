import { useCallback, useRef } from 'react';

let uidCounter = 0;
const nextId = () => `key-${Date.now()}-${(uidCounter += 1)}`;

/**
 * Returns a `getKey(item)` function that assigns each list item (object) a
 * stable, unique key on first sight and remembers it by reference — for use
 * as the `key` prop in FieldArray-rendered lists, instead of the array index
 * (which breaks React's reconciliation on reorder/insert/remove).
 */
export const useStableListKeys = () => {
  const keysRef = useRef(new WeakMap());

  const getKey = useCallback(item => {
    if (item === null || typeof item !== 'object') {
      return String(item);
    }
    if (!keysRef.current.has(item)) {
      keysRef.current.set(item, nextId());
    }
    return keysRef.current.get(item);
  }, []);

  return getKey;
};
