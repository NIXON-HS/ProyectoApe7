import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfirmService {
  
  confirm(message: string, title: string = 'Confirmar acción'): Promise<boolean> {
    if (typeof document === 'undefined') {
      return Promise.resolve(true); // Fallback for SSR/non-browser contexts
    }

    return new Promise((resolve) => {
      // 1. Create Overlay wrapper
      const overlay = document.createElement('div');
      overlay.className = 'fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#00283c]/40 backdrop-blur-sm transition-all duration-300 opacity-0 pointer-events-none';
      overlay.style.pointerEvents = 'none';

      // 2. Create Card container
      const card = document.createElement('div');
      card.className = 'bg-white/95 rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-white/60 shadow-2xl flex flex-col items-center gap-5 text-center transform scale-90 opacity-0 transition-all duration-300 ease-out';
      
      // Card content HTML
      card.innerHTML = `
        <!-- Warning Icon with soft glow animations -->
        <div class="w-16 h-16 rounded-full bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shadow-inner relative">
          <div class="absolute inset-0 rounded-full bg-rose-500/10 animate-ping opacity-75" style="animation-duration: 2s;"></div>
          <svg class="w-8 h-8 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
        </div>
        
        <!-- Content -->
        <div class="flex flex-col gap-2 text-center w-full">
          <h3 class="text-lg font-extrabold text-[#00283c] tracking-tight leading-tight">${title}</h3>
          <p class="text-xs text-slate-500 font-semibold leading-relaxed px-1">${message}</p>
        </div>
        
        <!-- Action Buttons -->
        <div class="grid grid-cols-2 gap-3.5 w-full mt-1">
          <button type="button" id="confirm-cancel-btn" class="w-full bg-slate-100 hover:bg-slate-200 text-slate-650 font-bold py-3 px-4 rounded-2xl cursor-pointer text-xs transition-all duration-200 active:scale-95 border border-slate-200/50">
            Cancelar
          </button>
          <button type="button" id="confirm-accept-btn" class="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-4 rounded-2xl cursor-pointer text-xs transition-all duration-200 active:scale-95 shadow-lg shadow-rose-600/15">
            Aceptar
          </button>
        </div>
      `;

      overlay.appendChild(card);
      document.body.appendChild(overlay);

      // Trigger animation-in on next macro-task
      setTimeout(() => {
        overlay.classList.remove('opacity-0', 'pointer-events-none');
        overlay.classList.add('opacity-100');
        overlay.style.pointerEvents = 'auto';
        
        card.classList.remove('scale-90', 'opacity-0');
        card.classList.add('scale-100', 'opacity-100');
      }, 10);

      // Clean up helper
      const destroyModal = (result: boolean) => {
        // Transition out
        overlay.classList.add('opacity-0');
        overlay.style.pointerEvents = 'none';
        card.classList.add('scale-90', 'opacity-0');
        
        setTimeout(() => {
          overlay.remove();
          resolve(result);
        }, 300);
      };

      // Button listeners
      const cancelBtn = card.querySelector('#confirm-cancel-btn');
      const acceptBtn = card.querySelector('#confirm-accept-btn');

      cancelBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        destroyModal(false);
      });

      acceptBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        destroyModal(true);
      });

      // Escape key listener
      const escListener = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          window.removeEventListener('keydown', escListener);
          destroyModal(false);
        }
      };
      window.addEventListener('keydown', escListener);
      
      // Backdrop click listener
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          destroyModal(false);
        }
      });
    });
  }
}
