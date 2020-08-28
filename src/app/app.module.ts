import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AngularFireModule, FirebaseOptionsToken } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { environment } from '../environments/environment';
import { AuthGuard } from './core/auth.guard';
import { AuthService } from './core/auth.service';
import { UserService } from './core/user.service';
import { SearchService } from './core/search.service';
import { NewsService } from './core/news.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from './core/token.interceptor';
import { BackendServiceService } from './core/backend-service.service';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing-module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { WindowRef } from './core/window.service';
import { ReactiveStreamsService } from './core/reactive-streams.service';
import { LoaderService } from './core/loader.service';
import { APP_BASE_HREF } from '@angular/common';
import {UserResolver} from './user/user.resolver';
import { LoggedNavModule } from './logged-nav/logged-nav.module';
import { ScriptLoaderService } from './core/script-loader.service';
import * as Hammer from 'hammerjs';
import { HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
export class MyHammerConfig extends HammerGestureConfig  {
  overrides = <any>{
      'swipe': { direction: Hammer.DIRECTION_ALL  }
  };
}

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserAnimationsModule,
        AppRoutingModule, LoggedNavModule,
        HttpClientModule,
        AngularFireModule.initializeApp(environment.firebase),
        AngularFireAuthModule
    ],
    providers: [ReactiveStreamsService, AuthService, UserService, NewsService, SearchService
        , WindowRef, AuthGuard, BackendServiceService, LoaderService, UserResolver, ScriptLoaderService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: TokenInterceptor,
            multi: true
        }, { provide: FirebaseOptionsToken, useValue: environment.firebase
        }, { provide: APP_BASE_HREF, useValue: '/' },
        { provide: HAMMER_GESTURE_CONFIG, useClass: MyHammerConfig }
    ],
    entryComponents: [],
    bootstrap: [AppComponent],
    exports: [
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {
  constructor() {
  }
}
