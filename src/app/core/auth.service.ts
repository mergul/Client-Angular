import {Injectable} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import * as firebase from 'firebase/app';

@Injectable({providedIn: 'root'})
export class AuthService {
    redirectUrl = 'login';
    private preemail = '';
    private prepass = '';

    constructor(
        public afAuth: AngularFireAuth
    ) {
    }

    doFacebookLogin(isMobile: boolean) {
        return new Promise<any>((resolve, reject) => {
            const provider = new firebase.auth.FacebookAuthProvider();
            provider.addScope('email');
            if (isMobile) {
                this.afAuth.auth.signInWithRedirect(provider)
                    .then(user => {
                        resolve(user);
                    }, err => {
                    //    console.log(err);
                        reject(err);
                    });
            } else {
                this.afAuth.auth
                    .signInWithPopup(provider)
                    .then(res => {
                        resolve(res);
                    }, err => {
                   //     console.log(err);
                        reject(err);
                    });
            }
        });
    }

    doTwitterLogin() {
        return new Promise<any>((resolve, reject) => {
            const provider = new firebase.auth.TwitterAuthProvider();
            this.afAuth.auth
                .signInWithPopup(provider)
                .then(res => {
                    resolve(res);
                }, err => {
                 //   console.log(err);
                    reject(err);
                });
        });
    }

    doGoogleLogin(isMobile: boolean) {
        return new Promise<any>((resolve, reject) => {
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('profile');
            provider.addScope('email');
            if (isMobile) {
                this.afAuth.auth.signInWithRedirect(provider)
                    .then(user => {
                        resolve(user);
                    }, err => {
                       // console.log(err);
                        reject(err);
                    });
            } else {
                this.afAuth.auth
                    .signInWithPopup(provider)
                    .then(res => {
                        resolve(res);
                    }, err => {
                      //  console.log(err);
                        reject(err);
                    });
            }
        });
    }

    doRegister(value): Promise<firebase.User> {
        return new Promise<any>((resolve, reject) => {
            firebase.auth().createUserWithEmailAndPassword(value.email, value.password)
                .then(res => {
                        resolve(res.user);
                    }, err => reject(err)
                ).catch(function(error) {
                // Handle Errors here.
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
            firebase.auth().signInWithEmailAndPassword(value.email, value.password)
                .then(res => {
                    resolve(res);
                }, err => reject(err));
        });
    }

    doAnonimousLogin() {
        return new Promise<any>((resolve, reject) => {
            firebase.auth().signInAnonymously()
                .then(res => {
                    resolve(res);
                }, err => reject(err));
        });
    }

    doLogout() {
        return new Promise((resolve, reject) => {
            if (firebase.auth().currentUser) {
                this.afAuth.auth.signOut();
                resolve();
            } else {
                reject();
            }
        });
    }

    getCurrentIdToken(): Promise<string> {
        return firebase.auth().currentUser.getIdToken(true);
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
        firebase.auth().currentUser.updatePassword(newPassword)
            .then(function () {
            }).catch(function (err) {
        });
    }
}
