import { Component, inject } from '@angular/core';
import { NotificationService } from '../../../core/notifications/notification.service';
import { TOAST_VARIANTS } from '../../../core/notifications/toast-variants';
import { Icon } from '../icon/icon';
import { SwipeToDismiss } from './swipe-to-dismiss';

@Component({
  selector: 'app-toasts',
  imports: [Icon, SwipeToDismiss],
  templateUrl: './toasts.html',
  styles: `
    .toast {
      animation: toast-in 240ms cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes toast-in {
      from {
        opacity: 0;
        transform: translateX(1rem) scale(0.96);
      }
      to {
        opacity: 1;
        transform: none;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .toast {
        animation: none;
      }
    }
  `,
})
export class Toasts {
  protected readonly notifications = inject(NotificationService);
  protected readonly variants = TOAST_VARIANTS;
}
