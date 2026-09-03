import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { APP_ROUTES } from '../../../constants/routes.constants';
import { AUTH } from '../../../constants/validation.constants';
import { AuthService } from '../../../core/auth/auth.service';
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
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly routes = APP_ROUTES;
  protected readonly submitting = signal(false);
  protected readonly formError = signal<string | null>(null);

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
    if (this.form.invalid || this.submitting()) {
      return;
    }

    this.submitting.set(true);
    this.formError.set(null);

    const { email, password, displayName } = this.form.getRawValue();

    this.auth.register({ email, password, displayName: displayName || null }).subscribe({
      next: () => this.router.navigateByUrl(APP_ROUTES.tasks),
      error: (error: HttpErrorResponse) => {
        this.submitting.set(false);
        this.formError.set(
          error.error?.detail ??
            error.error?.title ??
            'Unable to create your account. Please try again.',
        );
      },
    });
  }
}
