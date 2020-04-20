import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { Routes, RouterModule } from '@angular/router';
import {AdsComponent} from '../ads/ads.component';
import {NewsListModule} from '../news-list/news-list.module';
import {ModalContainerComponent} from '../news-details/modal-container-component';
import { LoggedNavModule } from '../logged-nav/logged-nav.module';

const routes: Routes = [
  {
    path: '', component: HomeComponent,
    children: [{ path: ':id', component: ModalContainerComponent }]
  },
];

@NgModule({
  declarations: [
    HomeComponent,
    AdsComponent
  ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        NewsListModule,
    ],
  entryComponents: [
  ],
  bootstrap: [HomeComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [AdsComponent, CommonModule]
})
export class HomeModule { }
