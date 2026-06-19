import { Component, OnInit, OnDestroy, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

type SplashState = 'loading' | 'error' | 'retrying';

@Component({
  selector: 'app-splash-screen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './splash-screen.html',
  styleUrls: ['./splash-screen.css']
})
export class SplashScreenComponent implements OnInit, OnDestroy {
  /** Fires when exit animation begins — parent should navigate / show next content NOW. */
  @Output() splashWillExit = new EventEmitter<void>();
  /** Fires when exit animation finishes — parent should remove splash from DOM. */
  @Output() splashComplete = new EventEmitter<void>();

  state: SplashState = 'loading';
  isExiting = false;

  private connectionOk: boolean | null = null; // null = pending
  private exitPending = false;
  private timers: ReturnType<typeof setTimeout>[] = [];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit()    { this.run(); }
  ngOnDestroy() { this.clearTimers(); }

  // ── Main flow ──────────────────────────────────────────────────────────────
  private run() {
    this.state       = 'loading';
    this.connectionOk = null;
    this.exitPending  = false;
    this.isExiting    = false;
    this.cdr.detectChanges();

    // Natural exit timer — fires after branding animation completes
    this.schedule(() => this.tryExit(), 2050);

    // Connectivity check runs in parallel with the animation.
    // Always wait at least 1200ms so the branding animation plays before
    // showing an error — otherwise navigator.onLine resolves instantly and
    // the ring never spins.
    Promise.all([
      this.checkConnectivity(),
      new Promise<void>(res => this.schedule(() => res(), 1200)),
    ]).then(([ok]) => {
      this.connectionOk = ok;

      if (!ok) {
        this.clearTimers();
        this.state = 'error';
        this.cdr.detectChanges();
        return;
      }

      // Connection OK — if the exit timer already fired while we were checking, exit now
      if (this.exitPending) {
        this.exitPending = false;
        this.doExit();
      }
      // Otherwise the timer will fire and find connectionOk = true
    });
  }

  private tryExit() {
    if (this.connectionOk === null) { this.exitPending = true; return; } // still checking
    if (this.connectionOk)          { this.doExit(); }
    // if false: error state already shown by checkConnectivity callback
  }

  private doExit() {
    this.isExiting = true;
    this.splashWillExit.emit();
    this.cdr.detectChanges();
    this.schedule(() => this.splashComplete.emit(), 580);
  }

  // ── Retry ──────────────────────────────────────────────────────────────────
  async retry() {
    if (this.state === 'retrying') return;
    this.state = 'retrying';
    this.connectionOk = null;
    this.exitPending  = false;
    this.cdr.detectChanges();

    const ok = await this.checkConnectivity();
    this.connectionOk = ok;

    if (!ok) {
      this.state = 'error';
      this.cdr.detectChanges();
    } else {
      this.doExit();
    }
  }

  // ── Connectivity check ─────────────────────────────────────────────────────
  private async checkConnectivity(): Promise<boolean> {
    // Fast-fail if browser reports offline
    if (!navigator.onLine) return false;

    try {
      const ctrl  = new AbortController();
      const tid   = setTimeout(() => ctrl.abort(), 5000);
      const res   = await fetch(`${environment.apiUrl}/info-grupo`, {
        method: 'HEAD',
        signal: ctrl.signal,
        cache:  'no-cache',
      });
      clearTimeout(tid);
      // Accept any HTTP response (even 4xx) — it means the server is reachable
      return res.status < 500;
    } catch {
      return false;
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  private schedule(fn: () => void, ms: number) {
    this.timers.push(setTimeout(fn, ms));
  }

  private clearTimers() {
    this.timers.forEach(t => clearTimeout(t));
    this.timers = [];
  }
}
