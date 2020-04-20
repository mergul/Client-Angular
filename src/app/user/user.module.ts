import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Routes, RouterModule } from '@angular/router';
import { UserComponent } from './user.component';
import { UserResolver } from './user.resolver';
import {ProfileModule} from '../profile-card/profile.module';
import {ModalContainerComponent} from '../news-details/modal-container-component';
import { IbanValidatorDirective } from '../iban-validator.directive';

const routes: Routes = [
  { path: 'edit', component: UserComponent, resolve: { data: UserResolver}},
  {
    path: '', component: UserComponent, resolve: { data: UserResolver },
    children: [{ path: ':id', component: ModalContainerComponent }]
  }
];


@NgModule({
  declarations: [
    UserComponent, IbanValidatorDirective
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NgbModule, ProfileModule
  ],
  entryComponents: [
  ],
  providers: [UserResolver],
  bootstrap: [UserComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [ CommonModule]
})
export class UserModule { }
