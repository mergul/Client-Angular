import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class CameraGuard implements CanActivate {
  user: any;
  room: any;
  message = 'You are redirected to Home';
  action = 'Please Login & Try Again';
  constructor(private router: Router, private _snackBar: MatSnackBar) {
  }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      if (this.router.getCurrentNavigation().extras.state) {
        this.user = this.router.getCurrentNavigation().extras.state.userID;
        this.room = this.router.getCurrentNavigation().extras.state.loggedID;
      }
      if (!this.room || !this.user) {
          this._snackBar.open(this.message, this.action, {
            duration: 3000,
          });
        this.router.navigate(['/']);
      }
      return true;
  }

}
