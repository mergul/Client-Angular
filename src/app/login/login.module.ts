import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../core/auth.guard';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './login.component';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatIconModule} from '@angular/material/icon';
import { GenericModalComponent } from '../shared-modal/generic-modal.component';
import { SharedModalModule } from '../shared-modal/shared-modal.module';

const routes: Routes = [
    {path: '', component: GenericModalComponent, canActivate: [AuthGuard]}
];

@NgModule({
    declarations: [
      LoginComponent
    ],
    imports: [
      CommonModule,
      RouterModule.forChild(routes), SharedModalModule,
      ReactiveFormsModule, MatTooltipModule, MatIconModule
    ],
    entryComponents: [ LoginComponent
    ],
    providers: [AuthGuard],
    bootstrap: [LoginComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    exports: [CommonModule]
  })
  export class LoginModule { }
