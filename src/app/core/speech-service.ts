import { Injectable, NgZone } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AppWindow extends Window {
    webkitSpeechRecognition: any;
    mozSpeechRecognition: any;
    msSpeechRecognition: any;
    SpeechRecognition: any;
}

const { webkitSpeechRecognition, mozSpeechRecognition, SpeechRecognition, msSpeechRecognition }: AppWindow = (window as any) as AppWindow;

export interface RecognitionResult {
    transcript?: string;
    info?: string;
    confidence?: number;
    error?: SpeechError;
}

export enum SpeechError {
    NO_SPEECH,
    NO_MICROPHONE,
    NOT_ALLOWED,
    BLOCKED
}

@Injectable({ providedIn: 'root' })
export class SpeechService {

    _supportRecognition: boolean;
    _speech: SpeechRecognition;
    private speechSubject = new BehaviorSubject<RecognitionResult>({transcript: 'Start Speaker!'});

    ignoreOnEnd: boolean;
    startTimestamp: any;
    utterance: SpeechSynthesisUtterance;
    private _mitext = '';

    constructor(private zone: NgZone, protected http: HttpClient) {
    }
    public init(): void {
        this._supportRecognition = true;
        console.log(window['SpeechRecognition']);
        if (window['SpeechRecognition']) {
            this._speech = new SpeechRecognition();
        } else if (window['webkitSpeechRecognition']) {
            this._speech = new webkitSpeechRecognition();
        } else if (window['msSpeechRecognition']) {
            this._speech = new msSpeechRecognition();
        } else if (window['mozSpeechRecognition']) {
            this._speech = new mozSpeechRecognition();
        } else {
            this._supportRecognition = false;
        }
        this.utterance = new SpeechSynthesisUtterance();

        console.log(`Speech supported: ${this._supportRecognition}`);
    }
    startSpeech(timestamp: any) {
        this.startTimestamp = timestamp;
        this._speech.start();
    }
    setLanguage(language: string) {
        this._speech.lang = language;
    }
    initializeSettings(language: string): void {
        this._speech.continuous = true;
        this._speech.interimResults = true;
        this._speech.lang = language;
        this.initListeners();
    }
    public set mitext(text) {
        this._mitext = text;
    }
    private initListeners() {
        this._speech.onstart = (ev) => {
            this.zone.run(() => this.speechSubject.next({ transcript: 'speak now!' }));
        };
        this._speech.onend = (ev) => {
            if (this.ignoreOnEnd) {
                return;
            }
            this.zone.run(() => {
                if (this._mitext !== '') { this.speechSubject.next({ transcript: this._mitext, info: 'print' }); }
                this.speechSubject.next({ transcript: 'speech ended!' });
            });
        };
        this._speech.onerror = (event: any) => {
            let result: SpeechError;
            if (event.error === 'no-speech') {
                result = SpeechError.NO_SPEECH;
                this.ignoreOnEnd = true;
            }
            if (event.error === 'audio-capture') {
                result = SpeechError.NO_MICROPHONE;
                this.ignoreOnEnd = true;
            }
            if (event.error === 'not-allowed') {
                if (event.timeStamp - this.startTimestamp < 100) {
                    result = SpeechError.BLOCKED;
                } else {
                    result = SpeechError.NOT_ALLOWED;
                }
                this.ignoreOnEnd = true;
            }
            this.zone.run(() => this.speechSubject.next({ error: result }));
        };
        this._speech.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                    console.log('interim transcript', event, interimTranscript);
                }
            }
            this.zone.run(() => {
                this.speechSubject.next({
                    info: 'final_transcript',
                    transcript: finalTranscript
                });
                this.speechSubject.next({
                    info: 'interim_transcript',
                    transcript: interimTranscript
                });
            });

        };
    }
    stop() {
        this._speech.stop();
    }
    getMessage(): Observable<RecognitionResult> {
        return this.speechSubject.asObservable();
    }
    translate = (options): Observable<string> => {
        const miurl = 'https://script.google.com/macros/s/AKfycbweT9Vi_HhKzrLB8yMx29oFQlsPHHPYcJ68LMojN_elqlO_QUrT/exec';
        let params = new HttpParams();
        params = params.append('q', options.q);
        params = params.append('target', options.target);
        params = params.append('source', options.source);
        params = params.append('callback', '?');
        return this.http.get<string>(miurl, {params}) ;
    }
    say = (options) => {
        this.utterance.lang = options.lang;
        this.utterance.text = options.text;

        window.speechSynthesis.speak(this.utterance);
    }
}
