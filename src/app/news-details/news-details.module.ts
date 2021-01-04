import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewsDetailsComponent } from './news-details.component';
// import { MediaSourceComponent } from '../media-source/media-source.component';
import { MediaSocialComponent } from '../media-social/media-social.component';
import { NewsManageComponent } from '../news-manage/news-manage.component';
// import {StackedModalModule} from '../stacked-modal/stacked-modal.module';
// import { VgControlsModule } from 'videogular2/compiled/src/controls/controls';
// import { VgBufferingModule } from 'videogular2/compiled/src/buffering/buffering';
// import { VgCoreModule } from 'videogular2/compiled/src/core/core';
// import { VgOverlayPlayModule } from 'videogular2/compiled/src/overlay-play/overlay-play';
import { FilesListComponent } from '../files-list/files-list.component';
import { FormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { DialogDetailsContainerComponent } from './dialog-details-container.component';
import * as Hammer from 'hammerjs';
import { HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { PostComponent } from '../post/post.component';
import { MatMenuModule } from '@angular/material/menu';
export class MyHammerConfig extends HammerGestureConfig {
  overrides = <any>{
    'swipe': { direction: Hammer.DIRECTION_ALL }
  };
}
const routes: Routes = [
  // { path: ':id', component: DialogDetailsContainerComponent }
];

@NgModule({
  declarations: [ DialogDetailsContainerComponent, NewsDetailsComponent,
    MediaSocialComponent, NewsManageComponent, FilesListComponent, PostComponent ],
  imports: [
    CommonModule, RouterModule.forChild(routes),
    FormsModule, MatDialogModule,
    MatSelectModule, MatInputModule,
    MatFormFieldModule, MatMenuModule,
    MatSnackBarModule, // StackedModalModule
    // VgControlsModule,
    // VgBufferingModule,
    // VgCoreModule,
    // VgOverlayPlayModule,
  ],
  entryComponents: [
    NewsDetailsComponent
  ],
  providers: [
    { provide: HAMMER_GESTURE_CONFIG, useClass: MyHammerConfig }
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [DialogDetailsContainerComponent, NewsDetailsComponent,
    MediaSocialComponent, FilesListComponent,
    NewsManageComponent, PostComponent, CommonModule, FormsModule]
})
export class NewsDetailsModule { }
