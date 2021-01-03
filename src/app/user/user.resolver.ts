import {Injectable} from '@angular/core';
import {Resolve, ActivatedRouteSnapshot, Router} from '@angular/router';
import {UserService} from '../core/user.service';
import {FirebaseUserModel} from '../core/user.model';
import { AuthService } from '../core/auth.service';

@Injectable({ providedIn: 'root' })
export class UserResolver implements Resolve<FirebaseUserModel> {

    constructor(public userService: UserService, private router: Router, private authService: AuthService) {
    }

    resolve(_route: ActivatedRouteSnapshot): Promise<FirebaseUserModel> {

        const user = new FirebaseUserModel();

        return new Promise((resolve, reject) => {
            this.authService.getCurrentUser()
                .then(res => {
                    if (res.providerData.length > 0 && !res.isAnonymous)  {
                        if (res.providerData[0].providerId === 'password') {
                            user.image = 'http://dsi-vd.github.io/patternlab-vd/images/fpo_avatar.png';
                        } else {
                            user.image = res.providerData[0].photoURL;
                        }
                        user.email = res.providerData[0].email;
                        user.name = res.displayName;
                        user.provider = res.providerData[0].providerId;
                        res.getIdToken().then(idToken => {
                            this.userService.user.token = idToken;
                        });
                        user.id = res.uid;
                //         this.reactiveService.setListeners('@' + Array.prototype.slice.call(([...Buffer.from(user.id.substring(0, 12))]))
                // .map(this.userService.hex.bind(this, 2)).join(''));
                        this.userService.user = user;
                        return resolve(user);
                    } else {
                        user.image = 'http://dsi-vd.github.io/patternlab-vd/images/fpo_avatar.png';
                        user.name = 'Anonymous';
                       // console.log(res.uid);
                        user.email = res.uid;
                        user.id = res.uid;
                        return resolve(user);
                    }
                }, err => {
                    this.router.navigate(['/login']);
                    return reject(err);
                });
        });
    }
}
