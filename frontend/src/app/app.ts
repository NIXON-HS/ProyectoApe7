import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, HostListener, OnInit, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { HeaderComponent } from './shared/header/header';
import { FooterComponent } from './shared/footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  title = 'REASONS - UTA';
  accessibilityPanelOpen = false;
  highContrastEnabled = false;
  fontScale = 1;

  private readonly document = inject(DOCUMENT);
  private readonly fontScales = [1, 1.1, 1.2, 1.3];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.highContrastEnabled = this.readBooleanSetting('reasons_a11y_contrast');
    this.fontScale = this.readNumberSetting('reasons_a11y_font_scale', 1);
    this.applyAccessibilityPreferences();
  }

  showNavbarAndFooter(): boolean {
    return !this.router.url.startsWith('/login');
  }

  toggleAccessibilityPanel(): void {
    this.accessibilityPanelOpen = !this.accessibilityPanelOpen;
  }

  closeAccessibilityPanel(): void {
    this.accessibilityPanelOpen = false;
  }

  toggleHighContrast(): void {
    this.highContrastEnabled = !this.highContrastEnabled;
    this.persistAccessibilityPreferences();
  }

  increaseFontSize(): void {
    const currentIndex = this.fontScales.indexOf(this.fontScale);
    const nextIndex = Math.min(currentIndex < 0 ? 0 : currentIndex + 1, this.fontScales.length - 1);
    this.fontScale = this.fontScales[nextIndex];
    this.persistAccessibilityPreferences();
  }

  decreaseFontSize(): void {
    const currentIndex = this.fontScales.indexOf(this.fontScale);
    const nextIndex = Math.max(currentIndex < 0 ? 0 : currentIndex - 1, 0);
    this.fontScale = this.fontScales[nextIndex];
    this.persistAccessibilityPreferences();
  }

  resetAccessibilityPreferences(): void {
    this.highContrastEnabled = false;
    this.fontScale = 1;
    this.persistAccessibilityPreferences();
  }

  get fontSizeLabel(): string {
    if (this.fontScale >= 1.3) {
      return 'Muy grande';
    }

    if (this.fontScale >= 1.2) {
      return 'Grande';
    }

    if (this.fontScale >= 1.1) {
      return 'Ligeramente grande';
    }

    return 'Normal';
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeAccessibilityPanel();
  }

  private persistAccessibilityPreferences(): void {
    localStorage.setItem('reasons_a11y_contrast', String(this.highContrastEnabled));
    localStorage.setItem('reasons_a11y_font_scale', String(this.fontScale));
    this.applyAccessibilityPreferences();
  }

  private applyAccessibilityPreferences(): void {
    const root = this.document.documentElement;

    root.classList.toggle('a11y-high-contrast', this.highContrastEnabled);
    root.style.setProperty('--reasons-font-scale', String(this.fontScale));
  }

  private readBooleanSetting(key: string): boolean {
    return localStorage.getItem(key) === 'true';
  }

  private readNumberSetting(key: string, fallback: number): number {
    const value = Number(localStorage.getItem(key));
    return Number.isFinite(value) && value > 0 ? value : fallback;
  }
}
