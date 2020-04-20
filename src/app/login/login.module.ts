import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthGuard } from '../core/auth.guard';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule, MatTooltipModule, MatButtonModule } from '@angular/material';
import { LoginComponent } from './login.component';

const routes: Routes = [
    {path: '', component: LoginComponent, canActivate: [AuthGuard]}
]

@NgModule({
    declarations: [
      LoginComponent
    ],
    imports: [
      CommonModule,
      RouterModule.forChild(routes),
      NgbModule, ReactiveFormsModule, MatTooltipModule, MatIconModule, MatButtonModule
    ],
    entryComponents: [
    ],
    providers: [AuthGuard],
    bootstrap: [LoginComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    exports: [CommonModule]
  })
  export class LoginModule { }