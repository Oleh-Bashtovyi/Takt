import { Injectable, computed, effect, signal } from '@angular/core';
import { ToastKind } from './toast-variants';

export interface Toast {
  id: string;
  kind: ToastKind;
  message: string;
}

const MAX_VISIBLE = 5;
const DURATION_MS = 5000;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly queue = signal<Toast[]>([]);
  private readonly timers = new Map<string, ReturnType<typeof setTimeout>>();

  readonly visible = computed(() => this.queue().slice(0, MAX_VISIBLE));

  constructor() {
    effect(() => {
      const live = new Set(this.visible().map((toast) => toast.id));

      for (const toast of this.visible()) {
        if (!this.timers.has(toast.id)) {
          this.timers.set(
            toast.id,
            setTimeout(() => this.dismiss(toast.id), DURATION_MS),
          );
        }
      }

      for (const [id, handle] of this.timers) {
        if (!live.has(id)) {
          clearTimeout(handle);
          this.timers.delete(id);
        }
      }
    });
  }

  success(message: string): void {
    this.push('success', message);
  }

  error(message: string): void {
    this.push('error', message);
  }

  warning(message: string): void {
    this.push('warning', message);
  }

  info(message: string): void {
    this.push('info', message);
  }

  dismiss(id: string): void {
    this.queue.update((toasts) => toasts.filter((toast) => toast.id !== id));
  }

  private push(kind: ToastKind, message: string): void {
    this.queue.update((toasts) => [...toasts, { id: crypto.randomUUID(), kind, message }]);
  }
}
