import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../core/auth.guard';
import { LoggedNavComponent } from './logged-nav.component';
import { NoLoggedNavComponent } from '../no-logged-nav/no-logged-nav.component';
import {OverlayModule} from '@angular/cdk/overlay';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatSelectModule} from '@angular/material/select';
import {MatToolbarModule} from '@angular/material/toolbar';

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
