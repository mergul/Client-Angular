import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HomeComponent } from './home.component';
import { Routes, RouterModule } from '@angular/router';
import { AdsComponent } from '../ads/ads.component';
import { MatTabsModule } from '@angular/material/tabs';
import { NewsListModule } from '../news-list/news-list.module';
import { DialogDetailsContainerComponent } from '../news-details/dialog-details-container.component';
import * as Hammer from 'hammerjs';
import { HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
export class MyHammerConfig extends HammerGestureConfig {
  overrides = <any>{
    'swipe': { direction: Hammer.DIRECTION_ALL }
  };
}
const routes: Routes = [
  {
    path: '', component: HomeComponent,
    children: [{ path: ':id', component: DialogDetailsContainerComponent }]
  },
];

@NgModule({
  declarations: [
    HomeComponent,
    AdsComponent
  ],
  imports: [
    CommonModule, RouterModule.forChild(routes),
    NewsListModule, MatTabsModule
  ],
  entryComponents: [
  ],
  providers: [
    { provide: HAMMER_GESTURE_CONFIG, useClass: MyHammerConfig }
  ],
  bootstrap: [HomeComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [AdsComponent]
})
export class HomeModule { }
