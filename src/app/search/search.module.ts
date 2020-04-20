import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from './search.component';
import { Routes, RouterModule } from '@angular/router';
import {NewsListModule} from '../news-list/news-list.module';
import {ProfileModule} from '../profile-card/profile.module';
import {ModalContainerComponent} from '../news-details/modal-container-component';

const routes: Routes = [
  {
    path: '', component: SearchComponent,
    children: [{ path: ':id', component: ModalContainerComponent }]
  },
];

@NgModule({
  declarations: [SearchComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NewsListModule, ProfileModule,
  ],
  entryComponents: [
  ],
  bootstrap: [SearchComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [CommonModule]
})
export class SearchModule { }
