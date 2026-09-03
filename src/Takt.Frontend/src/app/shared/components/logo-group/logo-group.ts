import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-logo-group',
  imports: [RouterLink],
  templateUrl: './logo-group.html',
})
export class LogoGroup {
  readonly link = input('/');
}
