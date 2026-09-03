import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { APP_ROUTES } from '../../../constants/routes.constants';
import { AUTH } from '../../../constants/validation.constants';
import { PasswordInput } from '../../../shared/components/password-input/password-input';
import { TextInput } from '../../../shared/components/text-input/text-input';
import { AuthCard } from '../auth-card/auth-card';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, AuthCard, TextInput, PasswordInput],
  templateUrl: './login.html',
})
export class Login {
  private readonly fb = inject(FormBuilder);

  protected readonly routes = APP_ROUTES;

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(AUTH.emailMax)]],
    password: ['', [Validators.required]],
  });

  protected submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
  }
}
