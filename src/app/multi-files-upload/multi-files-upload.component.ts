import {Component, OnInit, Inject, AfterViewInit, OnDestroy, Renderer2, ViewChild, ElementRef, HostListener} from '@angular/core';
import {FormBuilder, FormGroup, FormArray, FormControl} from '@angular/forms';
import {MultiFilesService} from './multi-files.service';
import {BackendServiceService} from '../core/backend-service.service';
import {Observable, Subject, from} from 'rxjs';
import {NewsFeed} from '../core/news.model';
import {DOCUMENT} from '@angular/common';
import { takeUntil, map } from 'rxjs/operators';
import { SpeechService, RecognitionResult } from '../core/speech-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserService } from '../core/user.service';

@Component({
    selector: 'app-multi-files-upload',
    templateUrl: './multi-files-upload.component.html',
    styleUrls: ['./multi-files-upload.component.css']
})
export class MultiFilesUploadComponent implements OnInit, AfterViewInit, OnDestroy {

    private readonly onDestroy = new Subject<void>();
    private _url: Array<string> = [];
    private _purl: Array<string> = [];
    private thumburl: Array<string> = [];
    protected thumbnails: Observable<string[]>;
    listenerFn: () => void;
    private signed: Map<string, string> = new Map<string, string>();
    public documentGrp: FormGroup;
    public newsFeed: NewsFeed;
    speechMessages: Observable<RecognitionResult>;
    languages: string[] = ['tr', 'en', 'es', 'de', 'fr'];
    currentLanguage = 'tr';
    finalTranscript: string;
    targetLanguage = 'fr';
    foods: Observable<MediaDeviceInfo[]>;
    startTopButtonDisabled: boolean;
    startDescButtonDisabled: boolean;
    whichButton: boolean;
    recognizing = false;
    localStream: MediaStream;
    private constraints = {
        video: false,
        audio: true
    };
    miTopText = '';
    miDescText = '';

    isTopicActivated = false;
    isDescActivated = false;
    @ViewChild('startTopButton', {static: true}) startTopButton: ElementRef;
    @ViewChild('startDescButton', {static: true}) startDescButton: ElementRef;
    @ViewChild('topBox', {static: true}) topBox: ElementRef;
    @ViewChild('textBox', {static: true}) textBox: ElementRef;
    color: string;
    wideStyle: { width: string; };
    loggedID: string;
    isTopicValid = false;
    isDescValid = false;

    constructor(private formBuilder: FormBuilder, public dialogRef: MatDialogRef<MultiFilesUploadComponent>,
                @Inject(MAT_DIALOG_DATA) public data: any,
                protected multifilesService: MultiFilesService, private _snackBar: MatSnackBar,
                private speechService: SpeechService, private service: UserService,
                private backendService: BackendServiceService,
                @Inject(DOCUMENT) private document: Document, private renderer: Renderer2
    ) {
        this.documentGrp = this.formBuilder.group({
            news_topic: new FormControl(['']),
            news_description: new FormControl(['']),
            items: this.formBuilder.array([this.createUploadDocuments()])
        });
        this.color = data.color;
    }

    ngOnInit() {
        const modalWidth = this.data.header$;
        this.wideStyle = {
            width: `${modalWidth}px`
        };
        this.thumbnails = this.multifilesService.getUrls();
        this.speechService.init();
        if (this.speechService._supportRecognition) {
            this.speechService.initializeSettings(this.currentLanguage);
            this.speechMessages = this.speechService.getMessage().pipe(map((text) => {
                this.finalTranscript = text.transcript;
                if (text.transcript && text.info === 'final_transcript') {
                    this.handleSentence(this.finalTranscript);
                } else if (text.transcript && text.info === 'print') {
                    this.handleSendButton(text.transcript);
                }
                if (this.isTopicActivated && this.miTopText) {
                    text.transcript = this.miTopText;
                } else if (this.isDescActivated && this.miDescText) {
                    text.transcript = this.miDescText;
                }
                return text;
            }));
        } else {
            this.startDescButtonDisabled = true;
            this.startTopButtonDisabled = true;
        }
        this.loggedID = window.history.state.loggedID;
        this.documentGrp.valueChanges.pipe(takeUntil(this.onDestroy)).subscribe(x => {
           this.isTopicValid = this.documentGrp.controls.news_topic.value.toString().trim().length > 3;
           this.isDescValid = this.documentGrp.controls.news_description.value.toString().trim().length > 3;
        });
    }
    @HostListener('window:keyup.esc') onKeyUp() {
        this.onClose();
    }
    handleSentence = (text) => {
        if (this.isTopicActivated && this.miTopText !== text) {
            this.miTopText += ' ' + text;
            this.speechService.mitext = this.miTopText;
        } else if (this.isDescActivated && this.miDescText !== text) {
            this.miDescText += ' ' +  text;
            this.speechService.mitext = this.miDescText;
        }
    }
    handleSendButton = (text) => {
        if (this.whichButton) {
            this.renderer.setAttribute(this.topBox.nativeElement, 'value', text);
        } else {
            this.renderer.setAttribute(this.textBox.nativeElement, 'value', text);
        }
        this.doPatch(text);
    }
    gotDevices(mediaDevices: MediaDeviceInfo[]) {
        return mediaDevices.filter(value => value.kind === 'audioinput');
    }
    startCamera(ev: Event) {
        this.whichButton = (ev.target as HTMLElement).parentElement.nextElementSibling.textContent.trimLeft().startsWith('Topic');
        if ((this.whichButton && this.startTopButton.nativeElement.innerHTML.startsWith('Start')) ||
        (!this.whichButton && this.startDescButton.nativeElement.innerHTML.startsWith('Start'))) {
            if (!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
                this.foods = from(navigator.mediaDevices.enumerateDevices()
                    .then(this.gotDevices));
                navigator.mediaDevices.getUserMedia(this.constraints)
                    .then(this.attachVideo.bind(this))
                    .catch(this.handleError);
            } else {
                alert('Sorry, camera not available.');
            }
            if (this.whichButton) {
                this.isTopicActivated = true;
                this.startDescButtonDisabled = true;
            } else {
                this.isDescActivated = true;
                this.startTopButtonDisabled = true;
            }
        } else {
            this.speechService.stop();
            if (this.whichButton) {
                this.renderer.setProperty(this.startTopButton.nativeElement, 'innerHTML', 'Start Microphone');
                this.renderer.addClass(this.startTopButton.nativeElement, 'button-outline');
                this.isTopicActivated = false;
                this.startDescButtonDisabled = false;
            } else {
                this.renderer.setProperty(this.startDescButton.nativeElement, 'innerHTML', 'Start Microphone');
                this.renderer.addClass(this.startDescButton.nativeElement, 'button-outline');
                this.isDescActivated = false;
                this.startTopButtonDisabled = false;
            }
            this.micStop(this.localStream);
        }
    }
    onSelectLanguage(language: string) {
        this.currentLanguage = language;
        this.speechService.setLanguage(this.currentLanguage);
    }
    attachVideo(stream) {
        this.localStream = stream;
        if (this.speechService._supportRecognition) {
            if (this.recognizing) {
                this.speechService.stop();
                return;
            }
            this.speechService.startSpeech(stream.startTime);
            if ( this.isTopicActivated) {
                this.renderer.setProperty(this.startTopButton.nativeElement, 'innerHTML', 'Stop Microphone');
                this.renderer.removeClass(this.startTopButton.nativeElement, 'button-outline');
            } else {
                this.renderer.setProperty(this.startDescButton.nativeElement, 'innerHTML', 'Stop Microphone');
                this.renderer.removeClass(this.startDescButton.nativeElement, 'button-outline');
            }
        }
    }
    handleError(error) {
        console.log('Error: ', error);
    }
    handleKey = (evt) => {
        if (evt.keyCode === 13 || evt.keyCode === 14) {
                this.handleSendButton(this.textBox.nativeElement.value);
        }
    }
    micStop(stream: MediaStream) {
        let tracks = null;
        if (stream != null) {
            tracks = stream.getTracks();
        }
        if (tracks != null) {
            tracks.forEach(function (track) {
                track.stop();
            });
        }
    }
    doPatch(term: any): any {
        if (this.whichButton) {
            this.documentGrp.controls.news_topic.patchValue(term);
        } else {
            this.documentGrp.controls.news_description.patchValue(term);
        }
    }

    get totalFiles(): Array<File> {
        return this.multifilesService.totalFiles;
    }

    get thumbs(): Map<string, Blob> {
        return this.multifilesService.thumbs;
    }

    createUploadDocuments(): FormGroup {
        return this.formBuilder.group({
            documentFile: File
        });
    }

    get items(): FormArray {
        return this.documentGrp.get('items') as FormArray;
    }
    removeAll() {
        this.totalFiles.splice(0, this.totalFiles.length);
        this.thumbs.clear();
        this._url.splice(0, this._url.length);
    }

    public generateThumbnail(videoFile: Blob, oldIndex: number): Promise<string> {

        const video: HTMLVideoElement = <HTMLVideoElement>this.document.createElement('video');
        const canvas: HTMLCanvasElement = <HTMLCanvasElement>this.document.createElement('canvas');
        const context: CanvasRenderingContext2D = canvas.getContext('2d');
        const name = oldIndex === 0 ? 'thumb-kapak-' : 'thumb-';
        return new Promise<string>((resolve, reject) => {
            canvas.addEventListener('error', reject);
            video.addEventListener('error', reject);
            video.addEventListener('canplay', () => {
                let wi, he;
                const rati = 174 / 109;
                const ra = video.videoWidth / video.videoHeight;
                if (ra > rati) {
                    wi = 174;
                    he = 109 * rati / ra;
                } else {
                    he = 109;
                    wi = 174 * ra / rati;
                }
                canvas.width = 174;
                canvas.height = 109;
                context.drawImage(video, canvas.width / 2 - wi / 2,
                    canvas.height / 2 - he / 2, wi, he);
                this.thumburl[oldIndex] = canvas.toDataURL('image/jpeg', 0.5);
                this.multifilesService.setUrls(this.thumburl);
                canvas.toBlob(blob => {
                    const df = this.totalFiles[oldIndex].name.lastIndexOf('.');
                    const gd = this.totalFiles[oldIndex].name.slice(0, df) + '.jpeg';
                    this.thumbs.set(name + gd, blob);
                    resolve(window.URL.createObjectURL(blob));
                }, 'image/jpeg', 0.5);
            });
            if (videoFile.type) {
                video.setAttribute('type', videoFile.type);
            }
            video.preload = 'auto';
            video.src = URL.createObjectURL(videoFile);
            video.load();
        });
    }

    public fileSelectionEvents(fileInput: any, oldIndex: number) {
        const files = fileInput.target.files;
        const index = this.totalFiles.length + oldIndex;
        for (let i = 0; i < files.length; i++) {
            if (!this.checkIt(files[i])) {
                this.fileSelectionEvent(files[i], index + i);
            } else {
            }
        }
    }

    public fileSelectionEvent(fileInput: any, oldIndex: number) {
        const canvas: HTMLCanvasElement = <HTMLCanvasElement>this.document.createElement('canvas');
        const context: CanvasRenderingContext2D = canvas.getContext('2d');
        const rat = 788 / 580;
        const rati = 174 / 109;
        this.totalFiles[oldIndex] = fileInput;
        if (this.totalFiles[oldIndex].type.includes('video')) {
            this.generateThumbnail(this.totalFiles[oldIndex], oldIndex).then(data => {
                    this._url[oldIndex] = data;
                }
            );
        } else if (this.totalFiles[oldIndex].type.includes('image')) {
            const reader = new FileReader();
            const image = new Image();
            const name = oldIndex === 0 ? 'thumb-kapak-' : 'thumb-';
            reader.onload = (event: any) => {
                image.setAttribute('src', event.target.result);
                image.onload = () => {
                    let wi, he;
                    const ra = image.naturalWidth / image.naturalHeight;
                    if (ra > rati) {
                        wi = 174;
                        he = 109 * rati / ra;
                    } else {
                        he = 109;
                        wi = 174 * ra / rati;
                    }
                    canvas.width = 174;
                    canvas.height = 109;
                    context.drawImage(image, canvas.width / 2 - wi / 2,
                        canvas.height / 2 - he / 2, wi, he);
                    this.thumburl[oldIndex] = canvas.toDataURL('image/jpeg', 0.5);
                    this.multifilesService.setUrls(this.thumburl);
                    canvas.toBlob(blob => {
                        const df = this.totalFiles[oldIndex].name.lastIndexOf('.');
                        const gd = this.totalFiles[oldIndex].name.slice(0, df) + '.jpeg';
                        this.thumbs.set(name + gd, blob);
                        this._url[oldIndex] = window.URL.createObjectURL(blob);
                    }, 'image/jpeg', 0.5);

                    if (ra > rat) {
                        wi = 788;
                        he = 580 * rat / ra;
                    } else {
                        he = 580;
                        wi = 788 * ra / rat;
                    }
                    canvas.width = 788;
                    canvas.height = 580;
                    context.drawImage(image, canvas.width / 2 - wi / 2,
                        canvas.height / 2 - he / 2, wi, he);
                    canvas.toBlob(blob => {
                        const df = this.totalFiles[oldIndex].name.lastIndexOf('.');
                        const gd = this.totalFiles[oldIndex].name.slice(0, df) + '.jpeg';
                        this.thumbs.set('medium-' + gd, blob);
                    }, 'image/jpeg', 0.5);
                };
            };
            reader.onloadend = () => {
            };
            reader.readAsDataURL(fileInput);
        }
    }

    uploadToSignStorage() {
        this.signed.forEach((value, key) => {
            const badf = this.totalFiles.find(value1 => key === value1.name);
            const fes = badf ? badf : this.thumbs.get(key);
            fetch(value, {
                method: 'PUT',
                headers: {
                    'Content-Type': fes.type // 'application/octet-stream'
                },
                body: fes
            }).then(valuem => {
                if (valuem.ok) {
                }
            });
        });
    }

    public OnSubmit(formValue: any) {
        const AllFilesObj = [];
        let MediaPartObj = [];
        if (this.signed.size > 1) {
            this.totalFiles.forEach((element) => {
                const eachObj = {
                    'file_name': element.name,
                    'file_type': element.type,
                    'has_medium': this.thumbs.has('medium-' + element.name.slice(0, element.name.lastIndexOf('.')) + '.jpeg')
                };
                AllFilesObj.push(eachObj);
            });
            MediaPartObj = Array.from(this.signed.keys());
        } else { // if (this.totalFiles.length === 0) {
            AllFilesObj.push({
                'file_name': 'bae.jpeg',
                'file_type': 'image/jpeg',
                'has_medium': true
            }, {
                'file_name': 'bae.jpeg',
                'file_type': 'image/jpeg',
                'has_medium': true
            }, {
                'file_name': 'bae.jpeg',
                'file_type': 'image/jpeg',
                'has_medium': true
            });
            MediaPartObj.push('bae.jpeg', 'thumb-kapak-bae.jpeg', 'medium-bae.jpeg', 'bae.jpeg', 'thumb-kapak-bae.jpeg', 'medium-bae.jpeg',
             'bae.jpeg', 'thumb-kapak-bae.jpeg', 'medium-bae.jpeg');
        }
        this._purl = formValue.news_topic.match(/#[a-zığüşöçĞÜŞÖÇİ0-9_.]+/gi);
        this.newsFeed = new NewsFeed(this.text2HTML(formValue.news_description), formValue.news_topic
            , this._purl != null ? this._purl : []
            , AllFilesObj, MediaPartObj, Date.now());

        this.backendService.postNews(this.newsFeed).pipe(takeUntil(this.onDestroy)).subscribe(() => {
          //  this.userService.increaseCount().pipe(takeUntil(this.onDestroy)).subscribe(value1 => {
                this.removeAll();
                this.dialogRef.close('/user');
                // });
        });
    }

    text2HTML(text: string) {
        if (text !== this.document.getElementById('news_description').getAttribute('value')) {
            return this.document.getElementById('news_description').getAttribute('value');
        } else {
            // 1: Plain Text Search
            let text1 = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

            // 2: Line Breaks
            text1 = text1.replace(/\r\n?|\n/g, '<br>');

            // 3: Paragraphs
            text1 = text1.replace(/<br>\s*<br>/g, '</p><p>');

            // 4: Wrap in Paragraph Tags
            text1 = '<p>' + text1 + '</p>';

            return text1;
        }
    }

    ngAfterViewInit() {
        this.renderer.setStyle(this.document.querySelector('.mat-dialog-container'), 'background', this.color);
        if (!this.speechService._supportRecognition) {
            this._snackBar.open('Your Browser has no support for Speech!', 'Try Chrome for Speech!', {
                duration: 3000,
              });
        }
    }

    onClose() {
        this.micStop(this.localStream);
        this.dialogRef.close((this.service.redirectUrl === '/upload' && !this.loggedID) ? '/home' : '');
    }

    onDialogClick(event: UIEvent) {
        event.stopPropagation();
        event.cancelBubble = true;
    }

    ngOnDestroy() {
        if (this.listenerFn) {
            this.listenerFn();
        }
        this.onDestroy.next();
        this.onDestroy.complete();
    }

    private checkIt(file: File): boolean {
        return this.totalFiles.some(value => value.name === file.name && value.size === file.size);
    }
}
