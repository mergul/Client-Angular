// import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
// import {Observable} from 'rxjs';
// import {AuthService} from './auth.service';
// import {Injectable} from '@angular/core';

// @Injectable( { providedIn: 'root' })
// export class CustomGuard implements CanActivate {
//     constructor(private router: Router, private service: AuthService) {}
//     canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
//         return new Promise((resolve, reject) => {
//             this.service.doPreLogin(this.service.getPreUser())
//                 .then(user => {
//                     if (user) {
//                         if (state.url !== '/prelogin') {
//                             return resolve(true);
//                         } else {
//                             this.router.navigate(['/']);
//                         }
//                     } else {
//                         if (state.url !== '/prelogin') {
//                             this.service.redirectUrl = state.url;
//                             this.router.navigate(['/prelogin']);
//                         }
//                        return resolve(true);
//                     }
//                 }, err => {
//                     // this.service.redirectUrl = state.url;
//                    // this.router.navigate(['/prelogin']);
//                     return resolve(true);
//                 });
//         });
//     }

// }
