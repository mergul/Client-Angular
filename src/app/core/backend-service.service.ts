import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {News, NewsFeed} from './news.model';

@Injectable({
    providedIn: 'root'
})
export class BackendServiceService {

    constructor(private httpClient: HttpClient) {
    }

    // private _controller: AbortController = new AbortController();
    // get abortController(): AbortController {
    //     return this._controller;
    // }

    // set abortController(value: AbortController) {
    //     this._controller = value;
    // }
    postImage(formData: FormData): Observable<News> {
        return this.httpClient.post<News>('/api/image/save', formData, {
            responseType: 'json',
            withCredentials: true,
            reportProgress: true
            // headers: {'Content-Type': "multipart/form-data;  charset=utf-8; boundary='--tet--'"}
        });
    }

    // deleteImage(_id: string): Observable<boolean> {
    //     return this.httpClient.delete('/api/image/delete/' + _id, {
    //         responseType: 'json'
    //     }).pipe(map(response => (<Boolean>response === true)));
    // }
    //
    // getSignedUrl(name: string): Observable<string> {
    //     return this.httpClient.get<string>('/api/rest/storage/' + name, {
    //         responseType: 'json'
    //     });
    // }
    postNews(newsFeed: NewsFeed): Observable<boolean> {
        return this.httpClient.post<boolean>('/api/rest/news/save', newsFeed, {
            responseType: 'json'
        });
    }
}
