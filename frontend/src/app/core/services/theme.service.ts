import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  darkMode = signal<boolean>(false);

  constructor() {
    const saved = localStorage.getItem('sms_theme');
    if (saved) {
      this.darkMode.set(saved === 'dark');
    } else {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.darkMode.set(prefersDark);
    }

    effect(() => {
      const isDark = this.darkMode();
      if (isDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('sms_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('sms_theme', 'light');
      }
    });
  }

  toggleTheme() {
    this.darkMode.update(val => !val);
  }

  toggleDarkMode() {
    this.toggleTheme();
  }

  isDarkMode(): boolean {
    return this.darkMode();
  }
}
