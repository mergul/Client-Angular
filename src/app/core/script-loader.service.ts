import { Injectable, Renderer2, Inject, RendererFactory2 } from '@angular/core';
import {Observable, Observer} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ScriptLoaderService {
    private scripts: ScriptModel[] = [];
    constructor() {
    }

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
            renderer.appendChild(_document.head, s);
           // document.head.appendChild(s);
        });
    }
    public load(script: ScriptModel): Observable<ScriptModel> {
        return new Observable<ScriptModel>((observer: Observer<ScriptModel>) => {
            const existingScript = this.scripts.find(s => s.name === script.name);

            // Complete if already loaded
            if (existingScript && existingScript.loaded) {
                observer.next(existingScript);
                observer.complete();
            } else {
                // Add the script
                this.scripts = [...this.scripts, script];

                // Load the script
                const scriptElement = document.createElement('script');
                scriptElement.type = 'text/javascript';
                scriptElement.src = script.src;

                scriptElement.onload = () => {
                    script.loaded = true;
                    observer.next(script);
                    observer.complete();
                };

                scriptElement.onerror = (error: any) => {
                    observer.error('Couldn\'t load script ' + script.src);
                };

                document.getElementsByTagName('body')[0].appendChild(scriptElement);
            }
        });
    }
}

export interface ScriptModel {
    name: string;
    src: string;
    loaded: boolean;
}
