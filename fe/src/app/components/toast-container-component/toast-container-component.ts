import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ToastService, ToastType } from '../toast-service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" aria-live="polite" aria-atomic="true">
      <div
        *ngFor="let toast of toasts(); trackBy: trackToast"
        class="toast"
        [ngClass]="'toast--' + toast.type"
        role="alert"
      >
        <span class="toast__icon-wrap">
          <span class="toast__icon">{{ icons[toast.type] }}</span>
        </span>

        <span class="toast__message">{{ toast.message }}</span>

        <button
          class="toast__close"
          type="button"
          (click)="close(toast.id)"
          aria-label="Cerrar notificación"
        >
          ✕
        </button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      width: 340px;
      pointer-events: none;
    }

    .toast {
      pointer-events: auto;
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.9rem 1rem;
      border-radius: 10px;
      background: #16171c;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-left: 3px solid var(--toast-accent, #6b7280);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
      animation: toast-in 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      font-family: inherit;
    }

    .toast__icon-wrap {
      flex-shrink: 0;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--toast-accent-bg, rgba(107, 114, 128, 0.15));
      margin-top: 1px;
    }

    .toast__icon {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--toast-accent, #9ca3af);
      line-height: 1;
    }

    .toast__message {
      flex: 1;
      color: #f4f4f5;
      font-size: 0.86rem;
      font-weight: 500;
      line-height: 1.4;
      padding-top: 2px;
    }

    .toast__close {
      background: transparent;
      border: none;
      color: #9ca3af;
      opacity: 0.7;
      cursor: pointer;
      font-size: 0.75rem;
      line-height: 1;
      padding: 3px;
      flex-shrink: 0;
      transition: opacity 0.15s, color 0.15s;
    }

    .toast__close:hover {
      opacity: 1;
      color: #f4f4f5;
    }

    .toast--success {
      --toast-accent: #22c55e;
      --toast-accent-bg: rgba(34, 197, 94, 0.15);
    }

    .toast--error {
      --toast-accent: #f43f5e;
      --toast-accent-bg: rgba(244, 63, 94, 0.15);
    }

    .toast--warning {
      --toast-accent: #f59e0b;
      --toast-accent-bg: rgba(245, 158, 11, 0.15);
    }

    .toast--info {
      --toast-accent: #3b82f6;
      --toast-accent-bg: rgba(59, 130, 246, 0.15);
    }

    @keyframes toast-in {
      from {
        opacity: 0;
        transform: translateX(24px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @media (max-width: 480px) {
      .toast-container {
        left: 1rem;
        right: 1rem;
        width: auto;
      }
    }
  `]
})
export class ToastContainerComponent {
  private readonly toastService = inject(ToastService);

  readonly toasts = this.toastService.toasts;

  readonly icons: Record<ToastType, string> = {
    success: '✓',
    error: '✕',
    warning: '!',
    info: 'i'
  };

  trackToast(_index: number, toast: { id: number }): number {
    return toast.id;
  }

  close(id: number): void {
    this.toastService.dismiss(id);
  }
}
