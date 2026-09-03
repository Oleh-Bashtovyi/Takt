import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { APP_ROUTES } from '../../../constants/routes.constants';
import { AUTH } from '../../../constants/validation.constants';
import { PasswordInput } from '../../../shared/components/password-input/password-input';
import { TextInput } from '../../../shared/components/text-input/text-input';
import { AuthCard } from '../auth-card/auth-card';
import { passwordsMatch } from '../passwords-match.validator';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, AuthCard, TextInput, PasswordInput],
  templateUrl: './register.html',
})
export class Register {
  private readonly fb = inject(FormBuilder);

  protected readonly routes = APP_ROUTES;

  protected readonly form = this.fb.nonNullable.group(
    {
      displayName: ['', [Validators.maxLength(AUTH.displayNameMax)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(AUTH.emailMax)]],
      password: ['', [Validators.required, Validators.minLength(AUTH.passwordMin)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordsMatch },
  );

  protected submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
  }
}
