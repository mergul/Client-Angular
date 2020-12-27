import {Injectable} from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor
} from '@angular/common/http';
import {Observable} from 'rxjs';
import {finalize} from 'rxjs/operators';
import {LoaderService} from './loader.service';
import {UserService} from './user.service';

const methods = ['PUT', 'POST', 'DELETE', 'PATCH'];

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

    constructor(private ui: LoaderService, private userService: UserService) {
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const user = this.userService.user;
        if (!methods.includes(request.method) && !request.url.includes('/user/') && !request.url.includes('/balance/')) {
            return next.handle(request);
        } else if (request.url.includes('/user/') || request.url.includes('/balance/')) {
           // return this.auth.getCurrentIdToken().pipe(
           //     switchMap((token: string) => {
                    const headers = request.headers;
                    // .set('Content-Type', 'multipart/form-data');
                    request = request.clone({
                        headers: headers.set('Authorization', `Bearer ${user.token}`), withCredentials: true
                    });
                    return next.handle(request);
            //    })
              //  switchMap((crequest) => next.handle(crequest))
          //  );
        } else {
            this.ui.show();
          //  return this.auth.getCurrentIdToken().pipe(
          //      map((token: string) => {
                    const headers = request.headers;
                    // .set('Content-Type', 'multipart/form-data');
                    request = request.clone({
                        headers: headers.set('Authorization', `Bearer ${user.token}`), withCredentials: true
                    });
                    return next.handle(request).pipe(finalize(() => {
                        //   setTimeout(() => {
                        // if (request.url === '/balance/rest/admin/newzcounts' || request.url === '/balance/rest/admin/admincommands') {
                        //     setTimeout(() => this.ui.hide(), 5000);
                        // } else 
                        if (this.ui.isLoading) {
                            this.ui.hide();
                        }
                        //   }, 0);
                    }));
           /*     }),
                switchMap((crequest) => next.handle(crequest).pipe(
                    finalize(() => {
                     //   setTimeout(() => {
                            if (this.ui.isLoading) {
                                this.ui.hide();
                            }
                     //   }, 0);
                    })
                ))
            );*/
        }
    }
}
