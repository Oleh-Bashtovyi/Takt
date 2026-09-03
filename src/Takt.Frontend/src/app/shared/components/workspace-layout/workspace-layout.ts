import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WorkspaceHeader } from '../workspace-header/workspace-header';

@Component({
  selector: 'app-workspace-layout',
  imports: [RouterOutlet, WorkspaceHeader],
  templateUrl: './workspace-layout.html',
})
export class WorkspaceLayout {}
