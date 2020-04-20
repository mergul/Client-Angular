import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthGuard } from '../core/auth.guard';
import { MatIconModule, MatTooltipModule, MatButtonModule } from '@angular/material';
import { MoneyManageComponent } from './money-manage.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

const routes: Routes = [
    {path: '', component: MoneyManageComponent}
];

@NgModule({
    declarations: [
        MoneyManageComponent
    ],
    imports: [
      CommonModule,
      RouterModule.forChild(routes), ReactiveFormsModule, FormsModule,
      NgbModule, MatTooltipModule, MatIconModule, MatButtonModule
    ],
    entryComponents: [
    ],
    providers: [AuthGuard],
    bootstrap: [MoneyManageComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    exports: [CommonModule]
  })
  export class MoneyManageModule { }
