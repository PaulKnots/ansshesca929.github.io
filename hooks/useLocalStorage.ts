
import { useState, useEffect } from 'react';

function getValue<T,>(key: string, initialValue: T): T {
  const savedValue = localStorage.getItem(key);
  if (savedValue) {
    try {
        return JSON.parse(savedValue);
    } catch(e) {
        console.error("Failed to parse value from local storage", e);
        localStorage.removeItem(key);
    }
  }
  if (initialValue instanceof Function) return initialValue();
  return initialValue;
}

export function useLocalStorage<T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    return getValue(key, initialValue);
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
