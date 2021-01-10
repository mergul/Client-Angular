import {Injectable} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {auth, User} from 'firebase/app';
import { from, Observable, of } from 'rxjs';
import { first, map, switchMap, take } from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class AuthService {
    private preemail = '';
    private prepass = '';
    user$: Observable<User>;
    token: Observable<string>;

    constructor(public afAuth: AngularFireAuth) {
        this.user$ = this.afAuth.authState;
    }
    getUser(): Observable<User> {
        return this.user$.pipe(first(), map(user=>{
            this.token=from(user.getIdToken());
            return user;
        }));
    }
    isLoggedIn(): Observable<boolean> {
        return this.user$.pipe(
          take(1),
          map(authState => !!authState)
        );
    }
    doFacebookLogin(isMobile: boolean) {
        return new Promise<any>((resolve, reject) => {
            const provider = new auth.FacebookAuthProvider();
            provider.addScope('email');
            if (isMobile) {
                this.afAuth.auth.signInWithRedirect(provider)
                    .then(user => {
                        resolve(user);
                    }, err => {
                        reject(err);
                    });
            } else {
                this.afAuth.auth
                    .signInWithPopup(provider)
                    .then(res => {
                        resolve(res);
                    }, err => {
                        reject(err);
                    });
            }
        });
    }

    doTwitterLogin() {
        return new Promise<any>((resolve, reject) => {
            const provider = new auth.TwitterAuthProvider();
            this.afAuth.auth
                .signInWithPopup(provider)
                .then(res => {
                    resolve(res);
                }, err => {
                    reject(err);
                });
        });
    }

    doGoogleLogin(isMobile: boolean) {
        return new Promise<any>((resolve, reject) => {
            const provider = new auth.GoogleAuthProvider();
            provider.addScope('profile');
            provider.addScope('email');
            if (isMobile) {
                this.afAuth.auth.signInWithRedirect(provider)
                    .then(user => {
                        resolve(user);
                    }, err => {
                        reject(err);
                    });
            } else {
                this.afAuth.auth
                    .signInWithPopup(provider)
                    .then(res => {
                        resolve(res);
                    }, err => {
                        reject(err);
                    });
            }
        });
    }

    doRegister(value): Promise<User> {
        return new Promise<any>((resolve, reject) => {
            this.afAuth.auth.createUserWithEmailAndPassword(value.email, value.password)
                .then(res => {
                        resolve(res.user);
                    }, err => reject(err)
                ).catch(function(error) {
                const errorCode = error.code;
                const errorMessage = error.message;
                if (errorCode === 'auth/weak-password') {
                    alert('The password is too weak.');
                } else {
                    alert(errorMessage);
                }
                console.log(error);
            });
        });
    }

    doLogin(value) {
        return new Promise<any>((resolve, reject) => {
            this.afAuth.auth.signInWithEmailAndPassword(value.email, value.password)
                .then(res => {
                    resolve(res);
                }, err => reject(err));
        });
    }

    doAnonimousLogin() {
        return new Promise<any>((resolve, reject) => {
            this.afAuth.auth.signInAnonymously()
                .then(res => {
                    resolve(res);
                }, err => reject(err));
        });
    }

    doLogout() {
        return new Promise((resolve, reject) => {
            if (this.afAuth.auth.currentUser) {
                this.afAuth.auth.signOut();
                resolve('');
            } else {
                reject();
            }
        });
    }

    getCurrentIdToken(): Promise<string> {
        return this.afAuth.auth.currentUser.getIdToken(true);
    }

    resetPassword(email: string) {
        return this.afAuth.auth.sendPasswordResetEmail(email, {
            'url': 'http://localhost:4200/auth', // Here we redirect back to this same page.
            'handleCodeInApp': true // This must be true.
        })
            .then(() => console.log('sent Password Reset Email!'))
            .catch((error) => console.log(error));
    }

    doPreLogin(value: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.checkIt(value).then(value1 => resolve(value1));
        });
    }

    checkIt(value: any) {
        this.preemail = value.email;
        this.prepass = value.password;
        return new Promise<any>((resolve, reject) => {
            return resolve(this.preemail === 'ismail' && this.prepass === 'ismail');
        });
    }

    getPreUser() {
        return {'email': this.preemail, 'password': this.prepass};
    }

    updatePassword(email: string, newPassword: string) {
        this.afAuth.auth.currentUser.updatePassword(newPassword)
            .then(function () {
            }).catch(function (err) {
        });
    }
    getCurrentUser() {
        return new Promise<any>((resolve, reject) => {
            this.afAuth.auth.onAuthStateChanged(function (userd) {
                if (userd) {
                    resolve(userd);
                } else {
                    reject('No user logged in');
                }
            });
        });
    }
    updateCurrentUser(value) {
        return new Promise((resolve, reject) => {
            const user = this.afAuth.auth.currentUser;
            user.updateProfile({
                displayName: value.name,
                photoURL: user.photoURL
            }).then(() => {
                resolve('User Successfully Updated');
            }, err => reject(err));
        });
    }
}
