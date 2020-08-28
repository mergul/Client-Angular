import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {ModalContainerComponent} from './modal-container-component';
import {NewsDetailsComponent} from './news-details.component';
import {MediaSourceComponent} from '../media-source/media-source.component';
import {MediaSocialComponent} from '../media-social/media-social.component';
import {NewsManageComponent} from '../news-manage/news-manage.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {MatTabsModule} from '@angular/material/tabs';
import {StackedModalModule} from '../stacked-modal/stacked-modal.module';
import {VgControlsModule} from 'videogular2/compiled/src/controls/controls';
import {VgBufferingModule} from 'videogular2/compiled/src/buffering/buffering';
import {VgCoreModule} from 'videogular2/compiled/src/core/core';
import {VgOverlayPlayModule} from 'videogular2/compiled/src/overlay-play/overlay-play';
import {FilesListComponent} from '../files-list/files-list.component';
import {TextFieldModule} from '@angular/cdk/text-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatSelectModule} from '@angular/material/select';

const routes: Routes = [
  //  { path: ':id', component: ModalContainerComponent }
];

@NgModule({
  declarations: [ModalContainerComponent, NewsDetailsComponent,
    MediaSourceComponent, MediaSocialComponent, NewsManageComponent, FilesListComponent],
  imports: [
    CommonModule, RouterModule.forChild(routes),
    NgbModule, FormsModule, ReactiveFormsModule,
    MatTabsModule, MatSelectModule,
    MatTooltipModule, MatInputModule, MatFormFieldModule,
    StackedModalModule, MatSnackBarModule,
    VgControlsModule,
    VgBufferingModule,
    VgCoreModule,
    VgOverlayPlayModule,
    TextFieldModule
  ],
  entryComponents: [
    NewsDetailsComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [ModalContainerComponent, NewsDetailsComponent,
        MediaSourceComponent, MediaSocialComponent, FilesListComponent,
        NewsManageComponent, MatTabsModule, MatTooltipModule, CommonModule]
})
export class NewsDetailsModule { }
