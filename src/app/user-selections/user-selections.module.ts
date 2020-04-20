import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../core/auth.guard';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatIconModule, MatTooltipModule, MatButtonModule
  , MatSelectModule, MatCheckboxModule, MatListModule} from '@angular/material';
import { UserSelectionsComponent } from './user-selections.component';

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
