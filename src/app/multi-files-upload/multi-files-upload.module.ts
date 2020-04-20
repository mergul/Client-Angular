import { MultiFilesUploadComponent } from './multi-files-upload.component';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthGuard } from '../core/auth.guard';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule, MatTooltipModule, MatButtonModule } from '@angular/material';
import { FilesThumbnailsComponent } from '../files-thumbnails/files-thumbnails.component';

const routes: Routes = [
    {path: '', component: MultiFilesUploadComponent, canActivate: [AuthGuard]}
]

@NgModule({
    declarations: [
      MultiFilesUploadComponent, FilesThumbnailsComponent
    ],
    imports: [
      CommonModule,
      RouterModule.forChild(routes),
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