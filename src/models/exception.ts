import { useEffect, useState } from 'react';

type Listener = () => void;
const listeners = new Set<Listener>();
let _count = 0;

export const exceptionStore = {
  get count(): number {
    return _count;
  },

  set count(value: number) {
    if (_count !== value) {
      _count = value;
      listeners.forEach((fn) => fn());
    }
  },

  subscribe(fn: Listener): () => void {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
};

export default function useExceptionModel(): { count: number; setCount: (value: number) => void } {
  const [count, setCount] = useState(_count);

  useEffect(() => {
    return exceptionStore.subscribe(() => setCount(_count));
  }, []);

  return {
    count,
    setCount: (value: number) => {
      exceptionStore.count = value;
    },
  };
}
