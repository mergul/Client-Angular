import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminComponent } from './admin.component';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../core/auth.guard';
import {NewsListModule} from '../news-list/news-list.module';
import {ModalContainerComponent} from '../news-details/modal-container-component';

const routes: Routes = [
  {
    path: '', component: AdminComponent, canActivate: [AuthGuard],
    children: [{ path: ':id', component: ModalContainerComponent }]
  },
];

@NgModule({
  declarations: [AdminComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NewsListModule
  ],
  entryComponents: [
  ],
  bootstrap: [AdminComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [AuthGuard]
})
export class AdminModule { }
