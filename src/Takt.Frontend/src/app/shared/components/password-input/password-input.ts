import { Component, input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

let nextId = 0;

const BASE =
  'w-full rounded-md border py-2.5 pl-3 pr-16 text-sm outline-none transition focus:ring-2 disabled:bg-gray-50';

@Component({
  selector: 'app-password-input',
  imports: [ReactiveFormsModule],
  templateUrl: './password-input.html',
})
export class PasswordInput {
  readonly control = input.required<FormControl<string>>();
  readonly label = input<string | null>(null);
  readonly autocomplete = input('off');
  readonly hint = input<string | null>(null);

  protected readonly id = `password-input-${nextId++}`;
  protected readonly revealed = signal(false);

  protected get invalid(): boolean {
    const control = this.control();
    return control.touched && control.invalid;
  }

  protected get fieldClass(): string {
    return this.invalid
      ? `${BASE} border-red-500 focus:ring-red-400`
      : `${BASE} border-gray-300 focus:ring-gray-900`;
  }

  protected toggleReveal(): void {
    this.revealed.update((value) => !value);
  }
}
