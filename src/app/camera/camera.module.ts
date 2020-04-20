import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CameraComponent } from './camera.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule, MatInputModule, MatSnackBarModule } from '@angular/material';
import { CameraGuard } from './camera.guard';

const routes: Routes = [
    {path: '', component: CameraComponent, canActivate: [CameraGuard]}
];

@NgModule({
    declarations: [
      CameraComponent
    ],
    imports: [
      CommonModule,
      RouterModule.forChild(routes),
      FormsModule, ReactiveFormsModule, MatSelectModule, MatInputModule, MatSnackBarModule
    ],
    entryComponents: [],
    providers: [CameraGuard],
    bootstrap: [CameraComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    exports: [CommonModule]
  })
export class CameraModule { }
