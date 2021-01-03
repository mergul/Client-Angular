import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FirebaseUserModel, User, UserTag, BalanceRecord } from './user.model';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { of } from 'rxjs/internal/observable/of';
import { Observable, Subject } from 'rxjs';
import { RecordSSE } from './RecordSSE';
import { NewsPayload } from './news.model';
import { ReactiveStreamsService } from './reactive-streams.service';

@Injectable({ providedIn: 'root' })
export class UserService implements OnDestroy {
    private readonly onDestroy = new Subject<void>();
    public user: FirebaseUserModel = new FirebaseUserModel();
    _loggedUser: FirebaseUserModel;
    userTag: UserTag = new UserTag();
    _totalBalance: number;
    email = '';
    dbUser: User;
    newsCo: Map<string, Array<string>> = new Map<string, Array<string>>();
    links = ['En Çok Okunanlar', 'Takip Edilen Etiketler', 'Takip Edilen Kişiler'];
    private _prof_url = '/assets/profile-img.jpeg';
    private _back_url: string;
    private _desc = of('Neque porro quisquam est, qui dolorem ipsum quia dolor sit'
        + ' amet, consectetur, adipisci velit, sed quia non numquam eius modi'
        + ' tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.');
    reStreamList$: Observable<NewsPayload[]>;
    reStreamCounts$: Observable<RecordSSE>;
    _otherUser: Observable<User>;
    _hotBalance: Observable<BalanceRecord[]>;
    _historyBalance: Observable<BalanceRecord[]>;
    redirectUrl = 'login';

    constructor(protected http: HttpClient, private router: Router, private reactiveService: ReactiveStreamsService
    ) {
    }
    getDbUser(url: string): Observable<User> {
        if (url) {
            this.email = this.loggedUser && this.loggedUser.email ? this.loggedUser.email : this.email;
            const username = this.loggedUser ? this.loggedUser.name : '';
            return this.http.get<User>(url, {
                responseType: 'json', withCredentials: true,
                params: { 'email': this.email, 'name': encodeURIComponent(username) }
            }).pipe();
        }
    }
    get loggedUser(): FirebaseUserModel {
        return this._loggedUser;
    }
    hex(length, n) {
        n = n.toString(16);
        return (n.length === length) ? n : '00000000'.substring(n.length, length) + n;
    }
    set loggedUser(logged: FirebaseUserModel) {
        this._loggedUser = logged;
        if (logged != null) {
            let url;
            this.email = logged.email ? logged.email : this.email;
            if (!this.dbUser && (!this.loggedUser || this.loggedUser.id.length !== 24)) {
                this._loggedUser.id = Array.prototype.slice.call(([...Buffer.from(logged.id.substring(0, 12))]))
                .map(this.hex.bind(this, 2)).join('');
                this.reactiveService.setListeners('@' + this._loggedUser.id, this.reactiveService.random);
                if (this._loggedUser.id) {
                    url = '/api/rest/start/user/' + this._loggedUser.id;
                } else {
                    url = '/api/rest/users/get/' + logged.email + '/a';
                }
                this.getDbUser(url + '/' + this.reactiveService.random).pipe(map(muser => {
                    this.setDbUser(muser);
                })).subscribe();
            }
            this.newsCo.set(this.links[0], ['main']);
        }
    }
    postUserImage(formData: FormData): Observable<boolean> {
        return this.http.patch<boolean>('/api/rest/user/media/save', formData, {
            responseType: 'json',
            withCredentials: true
        });
    }
    getUsers(usersList: string[]): Observable<Array<User>> {
        return this.http.get<Array<User>>('/api/rest/users/getAll/' + usersList, {
            responseType: 'json', withCredentials: true
        }).pipe();
    }
    get prof_url(): string {
        return this._prof_url;
    }
    set prof_url(value: string) {
        this._prof_url = value;
    }
    get back_url(): string {
        return this._back_url;
    }
    set back_url(value: string) {
        this._back_url = value;
    }
    get desc(): Observable<string> {
        return this._desc;
    }
    set desc(value: Observable<string>) {
        this._desc = value;
    }
    newSummary(id: string, summary: string) {
        return this.http.put<boolean>('/api/rest/description', { 'id': id, 'summary': summary }, {
            responseType: 'json', withCredentials: true
        }).pipe();
    }
    manageFollowingTag(_activeLink: string, adding: boolean) {
        if (this.dbUser) {
            this.userTag.id = this.dbUser.id;
            this.userTag.email = this.dbUser.email;
            this.userTag.tag = _activeLink;
            if (adding) {
                this.reactiveService.setUserListListeners(_activeLink, this.reactiveService.random);
                return this.http.put<boolean>('/api/rest/users/addtag/' + this.reactiveService.random, this.userTag, {
                    responseType: 'json', withCredentials: true
                }).pipe();
            } else {
                this.reactiveService.resetUserListListeners(_activeLink);
                return this.http.put<boolean>('/api/rest/users/removetag', this.userTag, {
                    responseType: 'json', withCredentials: true
                }).pipe();
            }
        } else {
            if (_activeLink.charAt(0) === '@') { this.redirectUrl = '/user/' + _activeLink.substring(1); }
            this.router.navigate(['/loginin']);
        }
        return of(false);
    }
    public setDbUser(muser: User) {
        if (muser != null && this.loggedUser && muser.username) {
            this.newsCo.set(this.links[1], muser.tags.map(value => {
                this.reactiveService.setUserListListeners('#' + value, this.reactiveService.random);
                return '#' + value;
            }));
            this.newsCo.set(this.links[2], muser.users.map(value => {
                this.reactiveService.setUserListListeners('@' + value, this.reactiveService.random);
                return '@' + value;
            }));
            this.loggedUser.tags = muser.tags;
            this.loggedUser.people = muser.users;
            this.loggedUser.totalNews = muser.contentsCount;
            this.loggedUser.followers = muser.followers;
            this.loggedUser.name = muser.firstname;
            this.loggedUser.id = muser.id;
            this.loggedUser.mediaParts = muser.mediaParts;
            this.loggedUser.iban = muser.iban;
            const leng = muser.mediaParts === undefined ? 0 : muser.mediaParts.length;
            if (leng !== 0) {
                muser.mediaParts.forEach(thumb => {
                    //  this.loggedUser.mediaParts.push(new ThumbModel(thumb['name'], thumb['content']));
                    const img = thumb === 1 ? 'back-img.jpeg' : 'profile-img.jpeg';
                    //       this.backend.fetchStream(img, '/api/rest/downloads/images/', 0)
                    //           .then(value => {
                    if (thumb === 1) {
                        this.back_url = 'https://storage.googleapis.com/sentral-news-media/' + muser.id + '-' + img;
                        if (leng === 1) {
                            this.prof_url = 'https://storage.googleapis.com/sentral-news-media/' + img;
                        }
                    } else if (thumb === 0) {
                        this.prof_url = 'https://storage.googleapis.com/sentral-news-media/' + muser.id + '-' + img;
                        if (leng === 1) {
                            this.back_url = 'https://storage.googleapis.com/sentral-news-media/' + img;
                        }
                    }
                    //        });
                });
            } else if (leng === 0) {
                this.prof_url = '/assets/' // 'https://storage.googleapis.com/sentral-news-media/'
                    + 'profile-img.jpeg'; // this.loggedUser.image;
                this.back_url = '/assets/' // 'https://storage.googleapis.com/sentral-news-media/'
                    + 'back-img.jpeg';
            }
            this.dbUser = muser;
            this.dbUser.roles = muser.roles === undefined ? ['ROLE_USER'] : muser.roles;
            this.dbUser.email = this.dbUser.email == null ? this.email : this.dbUser.email;
        } else if (this.loggedUser) {
            this.prof_url = '/assets/' // 'https://storage.googleapis.com/sentral-news-media/'
                + 'profile-img.jpeg'; // this.loggedUser.image;
            this.back_url = '/assets/' // 'https://storage.googleapis.com/sentral-news-media/'
                + 'back-img.jpeg';
        }
    }
    updateUser(userd: User) {
        return this.http.post<boolean>('/api/rest/userregis/save', userd, {
            responseType: 'json', withCredentials: true
        }).pipe();
    }

    deleteUser(userd: User) {
        return this.http.post<boolean>('/api/rest/userregis/delete', userd, {
            responseType: 'json', withCredentials: true
        }).pipe();
    }

    blockUser(userd: User, block: boolean) {
        const eng = block ? '1' : '0';
        return this.http.post<boolean>('/api/rest/userregis/block', { 'id': this.loggedUser.id, 'email': userd.id, 'tag': eng }, {
            responseType: 'json', withCredentials: true
        }).pipe();
    }
    getTotalBalance(id: string) {
        return this.http.get<BalanceRecord>('/api/rest/balance/total/@' + id, {
            responseType: 'json', withCredentials: true
        }).pipe();
    }
    checkOut(loggedUser: User) {
        return this.http.post<Boolean>('/api/rest/useradmin/userscheckout', loggedUser.id, {
            responseType: 'json', withCredentials: true
        }).pipe();
    }

    payToAll(value: string[]) {
        return this.http.post<boolean>('/api/rest/admin/handlePayments', value, {
            responseType: 'json', withCredentials: true
        }).pipe();
    }

    ngOnDestroy(): void {
        this.onDestroy.next();
    }
}
