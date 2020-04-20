import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicProfileComponent } from './public-profile.component';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {NewsListModule} from "../news-list/news-list.module";
import {ProfileModule} from "../profile-card/profile.module";
import {ModalContainerComponent} from "../news-details/modal-container-component";

const routes: Routes = [
  {path: '', component: PublicProfileComponent,
    children: [{ path: ':id', component: ModalContainerComponent }]},
];

@NgModule({
  declarations: [ PublicProfileComponent ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NgbModule, ProfileModule, NewsListModule
  ],
  entryComponents: [
  ],
  providers: [],
  bootstrap: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: []
})
export class PublicProfileModule { }
