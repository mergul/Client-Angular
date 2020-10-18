import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AngularFireModule, FirebaseOptionsToken } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { environment } from '../environments/environment';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from './core/token.interceptor';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing-module';
import { NoLoggedNavModule } from './no-logged-nav/no-logged-nav.module';
import { AuthService } from './core/auth.service';
import { UserService } from './core/user.service';
import { NewsService } from './core/news.service';
import { WindowRef } from './core/window.service';
import { ReactiveStreamsService } from './core/reactive-streams.service';
import { ScriptLoaderService } from './core/script-loader.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatSidenavModule} from '@angular/material/sidenav';

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        AppRoutingModule, NoLoggedNavModule,
        HttpClientModule, BrowserAnimationsModule,
        AngularFireModule.initializeApp(environment.firebase),
        AngularFireAuthModule, MatSidenavModule
    ],
    providers: [ReactiveStreamsService, AuthService, UserService, NewsService
        , WindowRef, ScriptLoaderService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: TokenInterceptor,
            multi: true
        }, { provide: FirebaseOptionsToken, useValue: environment.firebase
        },
    ],
    entryComponents: [],
    bootstrap: [AppComponent],
    exports: [ BrowserAnimationsModule
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {
  constructor() {
  }
}
