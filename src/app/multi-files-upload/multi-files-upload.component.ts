import {Component, OnInit, Inject, AfterViewInit, OnDestroy, Renderer2} from '@angular/core';
import {FormBuilder, FormGroup, FormArray} from '@angular/forms';
import {MultiFilesService} from './multifiles.service';
import {BackendServiceService} from '../core/backend-service.service';
import {Observable, of, Subject} from 'rxjs';
import {NewsFeed} from '../core/news.model';
import {DOCUMENT, Location} from '@angular/common';
import {UserService} from '../core/user.service';
import {Router} from '@angular/router';
import { takeUntil } from 'rxjs/operators';

declare function uploadItWorker(requests): any;
@Component({
    selector: 'app-multi-files-upload',
    templateUrl: './multi-files-upload.component.html',
    styleUrls: ['./multi-files-upload.component.css']
})
export class MultiFilesUploadComponent implements OnInit, AfterViewInit, OnDestroy {

    private readonly onDestroy = new Subject<void>();
    private _purl: Array<string> = [];
    private thumburl: Array<string> = [];
    showModal: Observable<boolean> = of(false);
    listenerFn: () => void;
    private signed: Map<string, string> = new Map<string, string>();
     public documentGrp: FormGroup;
    public newsFeed: NewsFeed;

    constructor(private formBuilder: FormBuilder,
                private multifilesService: MultiFilesService,
                private router: Router,
                private location: Location, private backendService: BackendServiceService,
                private userService: UserService, @Inject(DOCUMENT) private document: Document
    ) {
        this.documentGrp = this.formBuilder.group({
            news_topic: [''],
            news_description: [''],
            items: this.formBuilder.array([this.createUploadDocuments()])
        });
    }

    ngOnInit() {
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
        this.url.splice(0, this.url.length);
    }

    public generateThumbnail(videoFile: Blob, oldIndex: number): Promise<string> {

        const video: HTMLVideoElement = <HTMLVideoElement>this.document.createElement('video');
        const canvas: HTMLCanvasElement = <HTMLCanvasElement>this.document.createElement('canvas');
        const context: CanvasRenderingContext2D = canvas.getContext('2d');
        const name = oldIndex === 0 ? 'thumb-kapak-' : 'thumb-';
        return new Promise<string>((resolve, reject) => {
            canvas.addEventListener('error', reject);
            video.addEventListener('error', reject);
            video.addEventListener('canplay', event => {
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
                canvas.toBlob(blob => {
                    const df = this.totalFiles[oldIndex].name.lastIndexOf('.');
                    const gd = this.totalFiles[oldIndex].name.slice(0, df) + '.jpeg';
                    this.thumbs.set(name + gd, blob);
                    this.backendService.getSignedUrl(name + gd)
                    .pipe(takeUntil(this.onDestroy)).subscribe(value => {
                        this.signed.set(name + gd, value);
                    });
                    resolve(window.URL.createObjectURL(blob));
                }, 'image/jpeg', 0.5);
            });
            if (videoFile.type) {
                video.setAttribute('type', videoFile.type);
            }
            this.backendService.getSignedUrl(this.totalFiles[oldIndex].name)
            .pipe(takeUntil(this.onDestroy)).subscribe(value => {
                this.signed.set(this.totalFiles[oldIndex].name, value);
            });
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
                    this.url[oldIndex] = data;
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
                    canvas.toBlob(blob => {
                        const df = this.totalFiles[oldIndex].name.lastIndexOf('.');
                        const gd = this.totalFiles[oldIndex].name.slice(0, df) + '.jpeg';
                        this.thumbs.set(name + gd, blob);
                        this.url[oldIndex] = window.URL.createObjectURL(blob);
                        this.multifilesService.url[oldIndex] = this.url[oldIndex];
                        this.backendService.getSignedUrl(name + gd)
                        .pipe(takeUntil(this.onDestroy)).subscribe(value => {
                            this.signed.set(name + gd, value);
                        });
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
                        this.backendService.getSignedUrl('medium-' + gd)
                        .pipe(takeUntil(this.onDestroy)).subscribe(value => {
                            this.signed.set('medium-' + gd, value);
                        });
                    }, 'image/jpeg', 0.5);
                };
            };
            reader.onloadend = (event: any) => {
                this.backendService.getSignedUrl(this.totalFiles[oldIndex].name)
                .pipe(takeUntil(this.onDestroy)).subscribe(value => {
                    this.signed.set(this.totalFiles[oldIndex].name, value);
                });
            };
            reader.readAsDataURL(fileInput);
        }
    }

    get url(): Array<string> {
        return this.multifilesService.url;
    }

    set url(url: Array<string>) {
        this.multifilesService.url = url;
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
                 // console.log('Uploaded Successfully : ' + valuem.url);
                }
            });
        });
    }

    public OnSubmit(formValue: any) {
        this.uploadToSignStorage();
        const AllFilesObj = [];
        let MediaPartObj = [];
        if (this.totalFiles.length === 0) {
            AllFilesObj.push({
                'file_name': 'bae.jpeg',
                'file_type': 'image/jpeg',
                'has_medium': true
            });
            MediaPartObj.push('bae.jpeg', 'thumb-kapak-bae.jpeg', 'medium-bae.jpeg');
        } else {
            this.totalFiles.forEach((element, index) => {
                const eachObj = {
                    'file_name': element.name,
                    'file_type': element.type,
                    'has_medium': this.thumbs.has('medium-' + element.name.slice(0, element.name.lastIndexOf('.')) + '.jpeg')
                };
                AllFilesObj.push(eachObj);
            });
            MediaPartObj = Array.from(this.signed.keys());
        }
        this._purl = formValue.news_topic.match(/#[a-zığüşöçĞÜŞÖÇİ0-9_.]+/gi);
        this.newsFeed = new NewsFeed(this.text2HTML(formValue.news_description), formValue.news_topic
            , this._purl != null ? this._purl : []
            , AllFilesObj, MediaPartObj, Date.now());

        this.backendService.postNews(this.newsFeed).pipe(takeUntil(this.onDestroy)).subscribe(value => {
          //  this.userService.increaseCount().pipe(takeUntil(this.onDestroy)).subscribe(value1 => {
                this.removeAll();
                this.router.navigateByUrl('user');
           // });
        });
    }

    text2HTML(text: string) {
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

    ngAfterViewInit() {
        this.showModal = of(true);
    }

    onClose() {
        this.showModal = of(false);
        setTimeout(
            () => this.location.back(), // this.router.navigate(['/']),
            100
        );
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

    isValid() {
        return !this.documentGrp.controls.news_topic.pristine && !this.documentGrp.controls.news_description.pristine
            && this.documentGrp.controls.news_topic.value.toString().trim().length > 0
            && this.documentGrp.controls.news_description.value.toString().trim().length > 0;
    }
}
