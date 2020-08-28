import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../core/auth.guard';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { UserSelectionsComponent } from './user-selections.component';
import {MatListModule} from '@angular/material/list';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';

const routes: Routes = [
    {path: '', component: UserSelectionsComponent}
];

@NgModule({
    declarations: [
        UserSelectionsComponent
    ],
    imports: [
      CommonModule,
      RouterModule.forChild(routes), FormsModule,
      ReactiveFormsModule, MatTooltipModule, MatIconModule, MatButtonModule
      , MatCheckboxModule, MatListModule
    ],
    entryComponents: [
    ],
    providers: [AuthGuard],
    bootstrap: [UserSelectionsComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    exports: [CommonModule]
  })
  export class UserSelectionsModule { }
