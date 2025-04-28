import { browser } from '$app/environment';
import { writable } from 'svelte/store';

const storedTheme = browser ? localStorage.getItem('themeColor') : null;
export const isLightTheme = writable<boolean>(storedTheme === 'light_mode');

export function toggleTheme() {
  isLightTheme.update(value => {
    const newValue = !value;
    if (browser) {
      localStorage.setItem('themeColor', newValue ? 'light_mode' : 'dark_mode');
    }
    return newValue;
  });
}