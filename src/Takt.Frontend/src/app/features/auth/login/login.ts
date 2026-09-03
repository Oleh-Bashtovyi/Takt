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

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, AuthCard, TextInput, PasswordInput],
  templateUrl: './login.html',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly routes = APP_ROUTES;
  protected readonly submitting = signal(false);
  protected readonly formError = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(AUTH.emailMax)]],
    password: ['', [Validators.required]],
  });

  protected submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.submitting()) {
      return;
    }

    this.submitting.set(true);
    this.formError.set(null);

    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => this.router.navigateByUrl(APP_ROUTES.tasks),
      error: (error: HttpErrorResponse) => {
        this.submitting.set(false);
        this.formError.set(
          error.error?.detail ??
            error.error?.title ??
            'Unable to log in. Check your details and try again.',
        );
      },
    });
  }
}
