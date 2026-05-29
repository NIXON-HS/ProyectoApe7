import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
    if (typeof document === 'undefined') return;

    // Create toast container if it doesn't exist
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-[90%] sm:w-full';
      document.body.appendChild(container);
    }

    // Create toast element
    const toast = document.createElement('div');
    
    // Choose background color based on status type
    let bgClass = 'bg-[#0a3246]'; // default brand info blue
    if (type === 'success') bgClass = 'bg-[#3c9632]'; // reasons green
    if (type === 'error') bgClass = 'bg-rose-600'; // rose red
    if (type === 'warning') bgClass = 'bg-amber-500'; // amber warning

    toast.className = `${bgClass} text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4 text-xs font-semibold transform translate-y-10 opacity-0 transition-all duration-300 border border-white/10`;
    
    // Icon based on type
    let icon = `
      <svg class="h-4 w-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    `;
    if (type === 'success') {
      icon = `
        <svg class="h-4 w-4 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      `;
    }
    if (type === 'error') {
      icon = `
        <svg class="h-4 w-4 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
      `;
    }

    toast.innerHTML = `
      <div class="flex items-center gap-2.5">
        ${icon}
        <span>${message}</span>
      </div>
      <button class="text-white/60 hover:text-white font-bold text-base cursor-pointer focus:outline-none transition-colors">&times;</button>
    `;

    container.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.classList.remove('translate-y-10', 'opacity-0');
    }, 10);

    // Auto dismiss button click handler
    const closeBtn = toast.querySelector('button');
    closeBtn?.addEventListener('click', () => {
      this.dismiss(toast);
    });

    // Auto dismiss after 3.5s
    setTimeout(() => {
      this.dismiss(toast);
    }, 3500);
  }

  private dismiss(toast: HTMLElement) {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }
}
