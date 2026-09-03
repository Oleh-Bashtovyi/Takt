import { Component, input } from '@angular/core';
import { LogoGroup } from '../../../shared/components/logo-group/logo-group';

@Component({
  selector: 'app-auth-card',
  imports: [LogoGroup],
  templateUrl: './auth-card.html',
})
export class AuthCard {
  readonly title = input.required<string>();
  readonly subtitle = input<string | null>(null);
}
