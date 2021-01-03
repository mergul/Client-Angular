import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ScriptLoaderService {
    private ids: string[] = [];
    constructor() { }
    public checkExists = (id: string) => this.ids.includes(id);
    public injectScript(renderer, _document, href, tag, id, integrity, crossorigin) {
        return new Promise(function (resolve, reject) {
            const s = renderer.createElement(tag);
            s.onload = () => resolve(tag);
            s.onerror = () => reject(tag);
            if (tag === 'link') {
                s.setAttribute('rel', 'stylesheet');
                s.setAttribute('integrity', integrity);
                s.setAttribute('crossorigin', crossorigin);
                s.setAttribute('href', href);
            } else {
                s.setAttribute('type', 'text/javascript');
                s.setAttribute('id', id);
                s.setAttribute('data-add-client', integrity);
                if (crossorigin !== '') {
                    s.setAttribute('crossorigin', crossorigin);
                }
                s.setAttribute('src', href);
            }
            this.ids = [...this.ids, id];
            renderer.appendChild(_document.head, s);
        }.bind(this));
    }
}
