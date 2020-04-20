import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthGuard } from '../core/auth.guard';
import { MatIconModule, MatTooltipModule, MatButtonModule } from '@angular/material';
import { ReqComponent } from './req.component';

const routes: Routes = [
    {path: '', component: ReqComponent, canActivate: [AuthGuard]}
]

@NgModule({
    declarations: [
      ReqComponent
    ],
    imports: [
      CommonModule,
      RouterModule.forChild(routes),
      NgbModule, MatTooltipModule, MatIconModule, MatButtonModule
    ],
    entryComponents: [
    ],
    providers: [AuthGuard],
    bootstrap: [ReqComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    exports: [CommonModule]
  })
  export class ReqModule { }