import { Directive, ElementRef, computed, inject, output, signal } from '@angular/core';

@Directive({
  selector: '[appSwipeToDismiss]',
  host: {
    '(pointerdown)': 'onDown($event)',
    '(pointermove)': 'onMove($event)',
    '(pointerup)': 'onUp()',
    '(pointercancel)': 'onUp()',
    '[style.transform]': 'transform()',
    '[style.opacity]': 'opacity()',
    '[style.transition]': 'transition()',
  },
})
export class SwipeToDismiss {
  readonly dismissed = output<void>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly offset = signal<number | null>(null);
  private readonly dragging = signal(false);
  private startX = 0;

  protected readonly transform = computed(() => {
    const x = this.offset();
    return x === null ? '' : `translateX(${x}px)`;
  });

  protected readonly opacity = computed(() => {
    const x = this.offset();
    if (x === null || x <= 0) return null;
    return Math.max(0, 1 - x / this.width());
  });

  protected readonly transition = computed(() => {
    if (this.offset() === null) return null;
    return this.dragging() ? 'none' : 'transform 200ms ease, opacity 200ms ease';
  });

  protected onDown(event: PointerEvent): void {
    this.startX = event.clientX;
    this.offset.set(0);
    this.dragging.set(true);
    this.host.nativeElement.setPointerCapture(event.pointerId);
  }

  protected onMove(event: PointerEvent): void {
    if (!this.dragging()) return;
    this.offset.set(Math.max(0, event.clientX - this.startX));
  }

  protected onUp(): void {
    if (!this.dragging()) return;
    this.dragging.set(false);

    if ((this.offset() ?? 0) > this.width() * 0.35) {
      this.offset.set(this.width() + 40);
      setTimeout(() => this.dismissed.emit(), 180);
    } else {
      this.offset.set(0);
    }
  }

  private width(): number {
    return this.host.nativeElement.offsetWidth || 1;
  }
}
