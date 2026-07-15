import {
  inject,
  Injectable,
  NgZone,
  signal
} from '@angular/core';

export type ToastType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private readonly zone = inject(NgZone);

  private readonly _toasts = signal<Toast[]>([]);

  readonly toasts = this._toasts.asReadonly();

  private idCounter = 0;

  show(
    message: string,
    type: ToastType = 'info',
    duration = 4000
  ): void {
    const toast: Toast = {
      id: ++this.idCounter,
      message,
      type,
      duration
    };

    this.zone.run(() => {
      this._toasts.update(current => [
        ...current,
        toast
      ]);
    });

    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(toast.id);
      }, duration);
    }
  }

  success(message: string, duration = 4000): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration = 5000): void {
    this.show(message, 'error', duration);
  }

  warning(message: string, duration = 4500): void {
    this.show(message, 'warning', duration);
  }

  info(message: string, duration = 4000): void {
    this.show(message, 'info', duration);
  }

  dismiss(id: number): void {
    this.zone.run(() => {
      this._toasts.update(current =>
        current.filter(toast => toast.id !== id)
      );
    });
  }

  clear(): void {
    this.zone.run(() => {
      this._toasts.set([]);
    });
  }
}
