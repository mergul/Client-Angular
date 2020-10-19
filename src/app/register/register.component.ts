import { AfterViewInit, Component, OnDestroy, OnInit, Inject, Renderer2, HostListener } from '@angular/core';
import { AuthService } from '../core/auth.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { matchingPasswords } from './validators';
import { DOCUMENT } from '@angular/common';
import { UserService } from '../core/user.service';
import { FirebaseUserModel } from '../core/user.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, AfterViewInit, OnDestroy {

    registerForm: FormGroup;
    errorMessage = '';
    successMessage = '';
    listenerFn: () => void;
    color: string;
    wideStyle: { width: string; };

    constructor(
        private authService: AuthService,
        private userService: UserService,
        private router: Router,
        private dialogRef: MatDialogRef<RegisterComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
        private fb: FormBuilder,
        private _snackBar: MatSnackBar, @Inject(DOCUMENT) private _document: Document, private renderer: Renderer2
    ) {
        this.createForm();
        this.color = data.color;
    }
    ngOnInit(): void {
        const modalWidth = this.data.header$;
        this.wideStyle = {
            width: `${modalWidth}px`
        };
    }
    @HostListener('window:keyup.esc') onKeyUp() {
        this.dialogRef.close();
    }
    createForm() {
        this.registerForm = this.fb.group({
            name: ['', Validators.required],
            username: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required],
            password2: ['', Validators.required],
            sozlesme: [false, Validators.requiredTrue]
        }, { validator: matchingPasswords('password', 'password2') });
    }
    isFieldValid(field: string) {
        return !this.registerForm.get(field).valid && this.registerForm.get(field).touched;
    }
    tryFacebookLogin() {
        this.authService.doFacebookLogin(false)
            .then(() => {
                this.userService.redirectUrl !== 'login' ? this.onClose(this.userService.redirectUrl) :
                this.onClose('user');
             }, err => console.log(err)
            );
    }

    tryTwitterLogin() {
        this.authService.doTwitterLogin()
            .then(() => {
                this.userService.redirectUrl !== 'login' ? this.onClose(this.userService.redirectUrl) :
                this.onClose('user');
            }, err => console.log(err)
            );
    }

    tryGoogleLogin() {
        this.authService.doGoogleLogin(false)
            .then(() => {
                this.userService.redirectUrl !== 'login' ? this.onClose(this.userService.redirectUrl) :
                this.onClose('user');
            }, err => console.log(err)
            );
    }

    tryRegister(value) {
        this.authService.doRegister(value)
            .then(res => {
                res.sendEmailVerification({
                    'url': 'http://localhost:4200/auth', // Here we redirect back to this same page.
                    'handleCodeInApp': true // This must be true.
                }).then(() => {
                    this._snackBar.open('Verification Email Sent!', 'Check yor email please!', {
                        duration: 3000,
                    });

                    // alert('Verification Email Sent! Check yor email please!');
                    setTimeout(
                        () => this.router.navigate([this.userService.redirectUrl]),
                        1000
                    );
                });
                res.updateProfile({
                    displayName: value.name,
                    photoURL: ''
                }).then(function () {
                    // Update successful.
                }, function () {
                    // An error happened.
                });
                res.getIdToken().then(idToken => {
                    this.userService.user.token = idToken;
                    const fg = new FirebaseUserModel();
                    fg.token = idToken;
                    fg.email = res.email;
                    fg.id = res.uid;
                    fg.provider = 'auth';
                    fg.name = value.name;
                    this.userService.loggedUser = fg;
                    this.errorMessage = '';
                    this.successMessage = 'Your account has been created';
                });
            }, err => {
                console.log(err);
                this.errorMessage = err.message;
                this.successMessage = '';
            });
    }
    ngAfterViewInit() {
    //    setTimeout(() => {
            this.renderer.setStyle(this._document.querySelector('.mat-dialog-container'), 'background-color', this.color);
      //  });
    }

    onClose(redir) {
       // this.renderer.setStyle(this._document.querySelector('.mat-dialog-container'), 'background-color', 'transparent');
        this.dialogRef.close(redir);
    }

    onDialogClick(event: UIEvent) {
        event.stopPropagation();
        event.cancelBubble = true;
    }

    ngOnDestroy() {
        if (this.listenerFn) {
            this.listenerFn();
        }
    }
}
