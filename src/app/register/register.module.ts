import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthGuard } from '../core/auth.guard';
import { ReactiveFormsModule } from '@angular/forms';
import { RegisterComponent } from './register.component';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';

const routes: Routes = [
    {path: '', component: RegisterComponent, canActivate: [AuthGuard]}
];

@NgModule({
    declarations: [
      RegisterComponent
    ],
    imports: [
      CommonModule,
      RouterModule.forChild(routes),
      NgbModule, ReactiveFormsModule, MatTooltipModule, MatIconModule
      , MatButtonModule, MatCheckboxModule, MatSnackBarModule
    ],
    entryComponents: [
    ],
    providers: [AuthGuard],
    bootstrap: [RegisterComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    exports: [CommonModule]
  })
  export class RegisterModule { }
