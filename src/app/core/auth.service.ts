import { EventEmitter, Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth, User } from 'firebase/app';
import { from, Observable, of } from 'rxjs';
import { first, map, switchMap, take } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
    checkComplete = false;
    user$: Observable<User>;
    token: Observable<string>;
    changeEmitter = new EventEmitter<Observable<boolean>>();

    constructor(public afAuth: AngularFireAuth) {
        this.user$ = this.afAuth.authState;
    }
    getUser(): Observable<User> {
        return this.user$.pipe(first(), map(user => {
            if (user !== null) this.token = from(user.getIdToken());
            return user;
        }));
    }
    isLoggedIn(): Observable<boolean> {
        return this.user$.pipe(
            take(1),
            map(authState => !!authState)
        );
    }
    loginToGoogle(isMobile: boolean): Observable<User> {
        const provider = new auth.GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        if (isMobile) {
            return from(this.afAuth.auth.signInWithRedirect(provider)).pipe(switchMap(() => {
                return from(this.afAuth.auth.getRedirectResult());
            }), switchMap(credo => {
                this.changeEmitter.next(of(true));
                return of(credo.user);
            }))
        } else {
            return from(this.afAuth.auth.signInWithPopup(provider)).pipe(switchMap(credo => {
                this.changeEmitter.next(of(true));
                return of(credo.user);
            }));
        }
    }
    doRegister(value): Promise<User> {
        return new Promise<any>((resolve, reject) => {
            this.afAuth.auth.createUserWithEmailAndPassword(value.email, value.password)
                .then(res => {
                    this.changeEmitter.next(of(true));
                    resolve(res.user);
                }, err => reject(err)
                ).catch(function (error) {
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
    loginDo(value): Observable<User> {
        return from(this.afAuth.auth.signInWithEmailAndPassword(value.email, value.password)).pipe(switchMap(credo=>{
            this.changeEmitter.next(of(true));
            return of(credo.user);
        }));
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
