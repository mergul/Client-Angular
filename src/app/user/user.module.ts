import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { UserComponent } from './user.component';
import { UserResolver } from './user.resolver';
import {ProfileModule} from '../profile-card/profile.module';
import { IbanValidatorDirective } from '../iban-validator.directive';
import { DialogDetailsContainerComponent } from '../news-details/dialog-details-container.component';

const routes: Routes = [
  { path: 'edit', component: UserComponent, resolve: { data: UserResolver}},
  {
    path: '', component: UserComponent, resolve: { data: UserResolver },
    children: [{ path: ':id', component: DialogDetailsContainerComponent }]
  }
];


@NgModule({
  declarations: [
    UserComponent, IbanValidatorDirective
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ProfileModule
  ],
  entryComponents: [
  ],
  providers: [UserResolver],
  bootstrap: [UserComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [ CommonModule]
})
export class UserModule { }
