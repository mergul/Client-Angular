import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../core/auth.guard';
import { MatIconModule, MatTooltipModule, MatButtonModule, MatSelectModule, MatToolbarModule, MatMenuModule } from '@angular/material';
import { LoggedNavComponent } from './logged-nav.component';
import { NoLoggedNavComponent } from '../no-logged-nav/no-logged-nav.component';
import {OverlayModule} from '@angular/cdk/overlay';

const routes: Routes = [
];

@NgModule({
    declarations: [
      LoggedNavComponent, NoLoggedNavComponent,
    ],
    imports: [
      CommonModule,
      RouterModule.forChild(routes),
      MatTooltipModule, MatIconModule, MatButtonModule, MatMenuModule,
      MatSelectModule, MatToolbarModule, OverlayModule
    ],
    entryComponents: [
    ],
    providers: [AuthGuard],
    bootstrap: [LoggedNavComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    exports: [CommonModule, LoggedNavComponent, NoLoggedNavComponent,
      MatSelectModule, MatToolbarModule, MatMenuModule, MatIconModule, MatButtonModule
    ]
  })
  export class LoggedNavModule { }
