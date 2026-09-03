import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

let nextId = 0;

const BASE =
  'w-full rounded-md border px-3 py-2.5 text-sm outline-none transition focus:ring-2 disabled:bg-gray-50';

@Component({
  selector: 'app-text-input',
  imports: [ReactiveFormsModule],
  templateUrl: './text-input.html',
})
export class TextInput {
  readonly control = input.required<FormControl<string>>();
  readonly label = input<string | null>(null);
  readonly type = input<'text' | 'email'>('text');
  readonly placeholder = input('');
  readonly autocomplete = input('off');

  protected readonly id = `text-input-${nextId++}`;

  protected get invalid(): boolean {
    const control = this.control();
    return control.touched && control.invalid;
  }

  protected get fieldClass(): string {
    return this.invalid
      ? `${BASE} border-red-500 focus:ring-red-400`
      : `${BASE} border-gray-300 focus:ring-gray-900`;
  }
}
