import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule} from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatTooltipModule, MatMenuModule, MatIconModule, MatButtonModule } from '@angular/material';
import {NewsListModule} from '../news-list/news-list.module';
import {ProfileHeaderComponent} from '../profile-header/profile-header.component';
import {EditTagsListComponent} from '../edit-tags-list/edit-tags-list.component';
import {EditProfileComponent} from '../edit-profile/edit-profile.component';
import {ProfileCardComponent} from './profile-card.component';
import {ProfileListComponent} from '../profile-list/profile-list.component';
import {ProfileCenterComponent} from '../profile-center/profile-center.component';


@NgModule({
  declarations: [ ProfileHeaderComponent, EditTagsListComponent, EditProfileComponent,
    ProfileCardComponent, ProfileListComponent, ProfileCenterComponent ],
  imports: [
    CommonModule,
    RouterModule,
    NgbModule, NewsListModule,
    ReactiveFormsModule,
    FormsModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule
  ],
  entryComponents: [
  ],
  providers: [],
  bootstrap: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [ ProfileHeaderComponent, EditTagsListComponent, EditProfileComponent,
    ProfileCardComponent, ProfileListComponent, ProfileCenterComponent,
    ReactiveFormsModule,
    FormsModule,
    MatMenuModule, MatTooltipModule,
    MatIconModule,
    MatButtonModule, CommonModule
  ]
})
export class ProfileModule { }
