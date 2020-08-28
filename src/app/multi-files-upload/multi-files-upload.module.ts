import { MultiFilesUploadComponent } from './multi-files-upload.component';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthGuard } from '../core/auth.guard';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FilesThumbnailsComponent } from '../files-thumbnails/files-thumbnails.component';
import {MatSelectModule} from '@angular/material/select';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';

const routes: Routes = [
    {path: '', component: MultiFilesUploadComponent, canActivate: [AuthGuard]}
];

@NgModule({
    declarations: [
      MultiFilesUploadComponent, FilesThumbnailsComponent
    ],
    imports: [
      CommonModule, FormsModule,
      RouterModule.forChild(routes), MatSelectModule, MatFormFieldModule, MatSnackBarModule,
      NgbModule, ReactiveFormsModule, MatTooltipModule, MatIconModule, MatButtonModule
    ],
    entryComponents: [
    ],
    providers: [AuthGuard],
    bootstrap: [MultiFilesUploadComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    exports: [CommonModule]
  })
  export class MultiFilesUploadModule { }
