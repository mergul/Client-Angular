import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthGuard } from '../core/auth.guard';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule, MatTooltipModule, MatButtonModule, MatCheckboxModule } from '@angular/material';
import { RegisterComponent } from './register.component';

const routes: Routes = [
    {path: '', component: RegisterComponent, canActivate: [AuthGuard]}
]

@NgModule({
    declarations: [
      RegisterComponent
    ],
    imports: [
      CommonModule,
      RouterModule.forChild(routes),
      NgbModule, ReactiveFormsModule, MatTooltipModule, MatIconModule
      , MatButtonModule, MatCheckboxModule
    ],
    entryComponents: [
    ],
    providers: [AuthGuard],
    bootstrap: [RegisterComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    exports: [CommonModule]
  })
  export class RegisterModule { }