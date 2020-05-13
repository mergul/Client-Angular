import {Component, ElementRef, OnInit, Renderer2, ViewChild, OnDestroy, HostListener, NgZone} from '@angular/core';
import {BehaviorSubject, from, Observable, Subject, zip} from 'rxjs';
import {FormControl, Validators} from '@angular/forms';
import {MatSelectChange} from '@angular/material/select';
import {SignalingConnection} from './SignalingConnection';
import {SpeechService, RecognitionResult} from '../core/speech-service';
import {map, takeUntil} from 'rxjs/operators';

interface CameraEvent {
    peer?: string;
    fakeStream?: MediaStream;
    realStream?: MediaStream;
    user?: string;
}

@Component({
    selector: 'app-camera',
    templateUrl: './camera.component.html',
    styleUrls: ['./camera.component.scss']
})
export class CameraComponent implements OnInit, OnDestroy {

    constructor(private renderer: Renderer2, private speechService: SpeechService, private zone: NgZone) {
    }
    fakestream: MediaStream;
    fakelist: Map<string, string[]> = new Map<string, string[]>();

    currentLanguage = 'en';
    finalTranscript: string;
    targetLanguage = 'tr';
    @ViewChild('canvas', {static: true}) canvas: ElementRef;
    @ViewChild('soundCanvas', {static: true}) soundCanvas: ElementRef;
    private mediaRecorder: MediaRecorder;
    foods: Observable<MediaDeviceInfo[]>;
    videoWidth = 0;
    videoHeight = 0;

    private constraints = {
        video: {
            facingMode: 'environment',
            width: {ideal: 320},
            height: {ideal: 180},
            frameRate: {ideal: 20, max: 30},
        },
        audio: {
            sampleSize: 16,
            channelCount: 2,
            echoCancellation: false
        }
    };
    animalControl = new FormControl('', [Validators.required]);
    chunks = [];
    audioCtx: any;
    canvasCtx: any;
    isRecording = false;

    @ViewChild('startButton', {static: true}) startButton: ElementRef;
    @ViewChild('localVideo', {static: true}) localVideo: ElementRef;
    @ViewChild('remoteVideo1', {static: true}) remoteVideo1: ElementRef;
    @ViewChild('remoteVideo2', {static: true}) remoteVideo2: ElementRef;
    @ViewChild('remoteVideo3', {static: true}) remoteVideo3: ElementRef;
    @ViewChild('remoteVideo4', {static: true}) remoteVideo4: ElementRef;
    @ViewChild('remoteVideo5', {static: true}) remoteVideo5: ElementRef;
    @ViewChild('publicChatBox', {static: true}) publicChatBox: ElementRef;
    @ViewChild('textBox', {static: true}) textBox: ElementRef;
    @ViewChild('privateChatBox', {static: true}) privateChatBox: ElementRef;
    @ViewChild('speechTextBox', {static: true}) speechTextBox: ElementRef;

    startButtonDisabled = false;
    callButtonDisabled = true;
    hangupButtonDisabled = true;
    chatBoxDisabled = true;
    startTime: number;
    private localStream: MediaStream;
    private remoteStreamMap: Map<string, MediaStream> = new Map<string, MediaStream>();
    private peerLStream: Map<string, string[]> = new Map<string, string[]>();
    private peerRStream: Map<string, string[]> = new Map<string, string[]>();
    private mediaMap: Map<string, string> = new Map<string, string>();
    private hangedUps: string[] = [];
    private offerOptions: RTCOfferOptions = {
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
    };
    private refreshOfferOptions: RTCOfferOptions = {
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
        iceRestart: true
    };
    clientID: string;
    private peerConnection: RTCPeerConnection;
    private signalingConnection: SignalingConnection = null;
    userList: [];
    username: string;
    targetUsername: string;
    private caSubject = new BehaviorSubject<CameraEvent>({});
    peerList: Map<string, RTCPeerConnection> = new Map<string, RTCPeerConnection>();
    bandwidth = 128;
    private dataChannel: RTCDataChannel;
    private receiveChannel: RTCDataChannel;
    private dataChannelList: Map<string, RTCDataChannel> = new Map<string, RTCDataChannel>();
    private makingOffer = false;
    recognizing = false;
    speechMessages: Observable<RecognitionResult>;
    languages: string[] = ['en', 'es', 'de', 'fr', 'tr'];
    private readonly onDestroy = new Subject<void>();
    joinedUser = '';
    loggedUser = '';
    isNew = '';
    private peerSenders: Map<string, RTCRtpSender[]> = new Map<string, RTCRtpSender[]>();
    private peerReceivers: Map<string, RTCRtpTransceiver[]> = new Map<string, RTCRtpTransceiver[]>();
    private yostream = false;
    private shourenego: Map<string, boolean> = new Map<string, boolean>();
    // callMethod = (methodName, ...params) => obj => obj[methodName](...params);
    // awaitAll = promiseArray => Promise.all(promiseArray);
    // prop = propName => obj => obj[propName];
    // map = func => arr => arr.map(func);
    // pipe = (...functions) => functions.reduce((compound, func) => (input => func(compound(input))));
    // download = url => fetch(url).then(this.callMethod('json'));
    gotDevices(mediaDevices: MediaDeviceInfo[]) {
        return mediaDevices.filter(value => value.kind === 'videoinput');
    }
    @HostListener('window:beforeunload', ['$event'])
    async doSomething() {
        await this.closeAllVideoCall();
        this.signalingConnection.connection.close();
    }

    // vidPause(stream: MediaStream) {
    //     let tracks = null;
    //     if (stream != null) {
    //         tracks = stream.getTracks();
    //     }
    //     if (tracks != null) {
    //         tracks.forEach(function (track) {
    //             track.enabled = !track.enabled;
    //         });
    //     }
    // }
    vidOff(stream: MediaStream) {
        let tracks = null;
        if (stream != null) {
            tracks = stream.getTracks();
        }
        if (tracks != null) {
            if (this.remoteVideo1.nativeElement.srcObject &&
                this.remoteVideo1.nativeElement.srcObject.id === this.mediaMap.get(stream.id)) {
                this.remoteVideo1.nativeElement.srcObject = null;
            }
            if (this.remoteVideo2.nativeElement.srcObject &&
                this.remoteVideo2.nativeElement.srcObject.id === this.mediaMap.get(stream.id)) {
                this.remoteVideo2.nativeElement.srcObject = null;
            }
            if (this.remoteVideo3.nativeElement.srcObject &&
                this.remoteVideo3.nativeElement.srcObject.id === this.mediaMap.get(stream.id)) {
                this.remoteVideo3.nativeElement.srcObject = null;
            }
            tracks.forEach(function (track) {
                track.stop();
            });
        }
    }

    ngOnInit() {
        this.joinedUser = window.history.state ? window.history.state.userID : '';
        this.loggedUser = window.history.state ? window.history.state.loggedID : '';
        this.signalingConnection = new SignalingConnection(
            'busra.nur:65080/ws',
            () => this.startButtonDisabled = false,
            this.onSignalingMessage,
            this.joinedUser,
            this.loggedUser
        );
        // this.canvasCtx = this.soundCanvas.nativeElement.getContext('2d');
        this.speechService.init();
        if (this.speechService._supportRecognition) {
            this.speechService.initializeSettings(this.currentLanguage);
            this.speechMessages = this.speechService.getMessage().pipe(map((text) => {
                this.finalTranscript = text.transcript;
                if (text.transcript && text.info === 'final_transcript') {
                    this.chatBoxDisabled = false;
                    this.speechService.translate({q: this.finalTranscript, target: this.targetLanguage, source: this.currentLanguage})
                        .pipe(takeUntil(this.onDestroy)).subscribe((value) => {
                        this.handleSendButton(value, '');
                        //  this.speechService.say({lang: 'tr', text: value});
                    });
                    this.handleSendButton(this.finalTranscript, '');
                }
                return text;
            }));
        }
        this.caSubject.asObservable().pipe(takeUntil(this.onDestroy), map(async (cameraEvent) => {
            if (cameraEvent.peer) {
                await this.callDeep(cameraEvent.peer, cameraEvent.fakeStream);
                await this.handleNegotiationNeededEvent(this.offerOptions, cameraEvent.peer, cameraEvent.realStream ?
                    cameraEvent.realStream.id : cameraEvent.fakeStream.id, this.yostream)
                    .then(async () => {
                        if (cameraEvent.realStream) {
                            await this.setReplacement(cameraEvent.peer, cameraEvent.realStream.getVideoTracks()[0], cameraEvent.realStream);
                        } else {
                            if (!this.peerLStream.get(cameraEvent.peer)) {
                                this.peerLStream.set(cameraEvent.peer, [cameraEvent.fakeStream.id]);
                            } else {
                                this.peerLStream.get(cameraEvent.peer).push(cameraEvent.fakeStream.id);
                            }
                            this.fakelist.get(cameraEvent.peer).push(cameraEvent.fakeStream.id);
                            console.log('before calling faked.id --> ' + cameraEvent.fakeStream.id);
                            if (cameraEvent.user) { await this.callMeUser(cameraEvent.user); }
                        }
                    });
            }
        })).subscribe(value1 => console.log(value1));
    }

    startCamera() {
        if (!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
            this.trace('Requesting local stream');
            this.startButtonDisabled = true;
            this.foods = from(navigator.mediaDevices.enumerateDevices()
                .then(this.gotDevices));
            navigator.mediaDevices.getUserMedia(this.constraints)
                .then(this.attachVideo.bind(this))
                .catch(this.handleError);
        } else {
            alert('Sorry, camera not available.');
        }
    }

    // startScreenShare() {
    //     if (!!(navigator.mediaDevices && 'getDisplayMedia' in navigator.mediaDevices)) {
    //         this.startButtonDisabled = true;
    //         navigator.mediaDevices.getDisplayMedia(this.constraints)
    //             .then(this.attachVideo.bind(this))
    //             .catch(this.handleError);
    //     } else {
    //         alert('Sorry, camera not available.');
    //     }
    // }
    stopSample = async (user) => {
        await this.hangUpCall(user);
        this.startButtonDisabled = false;
    }

    attachVideo(stream) {
        this.renderer.setProperty(this.localVideo.nativeElement, 'srcObject', stream);
        this.renderer.listen(this.localVideo.nativeElement, 'play', () => {
            this.videoHeight = this.localVideo.nativeElement.videoHeight;
            this.videoWidth = this.localVideo.nativeElement.videoWidth;
        });

        this.trace('Received local stream: ' + stream.id);
        this.localStream = stream;
        this.fakestream = new MediaStream([this.localStream.getVideoTracks()[0]]);
        this.fakestream.removeTrack(this.fakestream.getVideoTracks()[0]);
        this.callButtonDisabled = false;
        if (this.speechService._supportRecognition) {
            if (this.recognizing) {
                this.speechService.stop();
                return;
            }
            this.speechService.startSpeech(stream.startTime);
        }
        this.mediaRecorder = new MediaRecorder(stream);
        //   this.visualize(stream);
        this.mediaRecorder.onstop = async () => {
            const audio = new Audio();
            const blob = new Blob(this.chunks, {'type': 'audio/ogg; codecs=opus'});
            this.chunks.length = 0;
            audio.src = window.URL.createObjectURL(blob);
            audio.load();
            await audio.play();
        };

        this.mediaRecorder.ondataavailable = e => this.chunks.push(e.data);
    }

    onSelectLanguage(language: string) {
        this.currentLanguage = language;
        this.speechService.setLanguage(this.currentLanguage);
    }

    onSelectTargetLanguage(language: string) {
        this.targetLanguage = language;
    }

    public record() {
        this.isRecording = true;
        this.mediaRecorder.start();
    }

    public stop() {
        this.isRecording = false;
        this.mediaRecorder.stop();
    }

    capture() {
        this.renderer.setProperty(this.canvas.nativeElement, 'width', this.videoWidth);
        this.renderer.setProperty(this.canvas.nativeElement, 'height', this.videoHeight);
        this.canvas.nativeElement.getContext('2d').drawImage(this.localVideo.nativeElement, 0, 0);
    }

    handleError(error) {
        console.log('Error: ', error);
    }

    onBookChange($event: MatSelectChange) {
        this.constraints.video.facingMode = this.constraints.video.facingMode === 'user' ? 'environment' : 'user';
        console.log($event.value);
    }

    onSignalingMessage = async (msg) => {
        let text = '';
        const time = new Date(msg.date);
        const timeStr = time.toLocaleTimeString();
        switch (msg.event) {
            case 'id':
                if (!this.clientID) {
                    this.clientID = msg.id;
                }
                this.userList = msg.users;
                this.setUsername();
                break;
            case 'message':
                text = '<div style="background: #e1ffc7; margin-bottom: 10px; padding: 10px">' + '<strong>' + msg.id
                    + '</strong> <br>' + msg.text + '<span>' + '<span style="padding: 10px; float: right;">' + timeStr +
                    '</span>' + '</span></div>';
                break;
            case 'rejectusername':
                this.username = msg.name;
                console.log(
                    `Your username has been set to <${
                        msg.name
                    }> because the name you chose is in use`
                );
                break;

            case 'userlist': // Received an updated user list
                this.userList = msg.users;
                break;

            case 'offer': // our offer
                console.log(
                    'Calling connectionOffer from PeerConnection.onSignalingMessage'
                );
                await this.connectionOffer(msg);
                break;

            case 'answer': // Callee has answered our offer
                console.log(
                    'Calling connectionAnswer from PeerConnection.onSignalingMessage'
                );
                await this.connectionAnswer(msg);
                break;

            case 'candidate': // A new ICE candidate has been received
                await this.newICECandidate(msg);
                break;

            case 'hang-up': // The other peer has hung up the call
                await this.handleHangUpMsg(msg);
                break;
        }
        if (text.length) {
            this.renderer.setProperty(this.publicChatBox.nativeElement, 'innerHTML', this.publicChatBox.nativeElement.innerHTML + text);
            this.publicChatBox.nativeElement.scrollTop = this.publicChatBox.nativeElement.scrollHeight -
                this.publicChatBox.nativeElement.clientHeight;
        }
    }

    handleSendButton = (message, fakeId) => {
        const msg = {
            text: message,
            event: 'message',
            id: this.clientID,
            room: this.loggedUser,
            fake: fakeId,
            date: Date.now()
        };
        this.signalingConnection.sendToServer(msg);
        this.textBox.nativeElement.value = '';
    }

    handleKey = (evt) => {
        if (evt.keyCode === 13 || evt.keyCode === 14) {
            if (!this.chatBoxDisabled) {
                this.handleSendButton(this.textBox.nativeElement.value, '');
            }
        }
    }

    setUsername = () => {
        if (!this.username) {
            this.username = this.clientID;
        }
    }

    newICECandidate = async (msg) => {
        try {
            const candidate = new RTCIceCandidate(msg.candidate);
            await this.peerList.get(msg.source).addIceCandidate(candidate);
            //   await this.peerList.get(msg.target).addIceCandidate(candidate);
        } catch (error) {

        }
    }
    createPeerConnection = () => {
        if (this.peerList.has(this.targetUsername)) {
            this.peerConnection = this.peerList.get(this.targetUsername);
            return;
        }
        this.peerConnection = new RTCPeerConnection({
            iceServers: [     // Information about ICE servers - Use your own!
                {
                    urls: 'stun:stun.l.google.com:19302'
                }
            ]
        });
        this.peerList.set(this.targetUsername, this.peerConnection);
        this.peerConnection.onicecandidate = (event) => this.handleICECandidateEvent(event);
        this.peerConnection.oniceconnectionstatechange = this.handleICEConnectionStateChangeEvent;
        this.peerConnection.onicegatheringstatechange = this.handleICEGatheringStateChangeEvent;
        this.peerConnection.onsignalingstatechange = this.handleSignalingStateChangeEvent;
        this.peerConnection.onnegotiationneeded = () => this
            .handleNegotiationNeededEvent(this.offerOptions, this.targetUsername, this.isNew, this.yostream);
        this.peerConnection.ontrack = this.gotRemoteStream.bind(this);
        this.peerSenders.set(this.targetUsername, []);
        this.peerReceivers.set(this.targetUsername, []);
        this.shourenego.set(this.targetUsername, false);
    }
    gotRemoteStream = (e) => {
        this.trace('set RemoteStream by: ' + this.username + '--id: ' + e.streams[0].id);
        if (e.streams[0].id === this.localStream.id) {
            return;
        } else if (this.remoteStreamMap.size === 0) {
            this.remoteVideo1.nativeElement.srcObject =
                new MediaStream([e.streams[0].getTracks()[e.streams[0].getTracks().length - 1]]);
            this.remoteStreamMap.set(e.streams[0].id, e.streams[0]);
            this.mediaMap.set(e.streams[0].id, this.remoteVideo1.nativeElement.srcObject.id);
        } else if (!this.remoteStreamMap.has(e.streams[0].id)) {
            if (!this.remoteVideo2.nativeElement.srcObject) {
                this.remoteVideo2.nativeElement.srcObject = // new MediaStream([e.transceiver.receiver.track]);
                    new MediaStream([e.streams[0].getTracks()[e.streams[0].getTracks().length - 1]]);
               // this.remoteVideo2.nativeElement.srcObject = e.streams[0];
                this.remoteStreamMap.set(e.streams[0].id, e.streams[0]);
                this.mediaMap.set(e.streams[0].id, this.remoteVideo2.nativeElement.srcObject.id);
            } else if (!this.remoteVideo3.nativeElement.srcObject) {
                this.remoteVideo3.nativeElement.srcObject =
                    new MediaStream([e.streams[0].getTracks()[e.streams[0].getTracks().length - 1]]);
                // this.remoteVideo3.nativeElement.srcObject = e.streams[0];
                this.remoteStreamMap.set(e.streams[0].id, e.streams[0]);
                this.mediaMap.set(e.streams[0].id, this.remoteVideo3.nativeElement.srcObject.id);
            } else if (!this.remoteVideo4.nativeElement.srcObject) {
                this.remoteVideo4.nativeElement.srcObject =
                    new MediaStream([e.streams[0].getTracks()[e.streams[0].getTracks().length - 1]]);
                // this.remoteVideo4.nativeElement.srcObject = e.streams[0];
                this.remoteStreamMap.set(e.streams[0].id, e.streams[0]);
                this.mediaMap.set(e.streams[0].id, this.remoteVideo4.nativeElement.srcObject.id);
            } else if (!this.remoteVideo5.nativeElement.srcObject) {
                this.remoteVideo5.nativeElement.srcObject =
                    new MediaStream([e.streams[0].getTracks()[e.streams[0].getTracks().length - 1]]);
                // this.remoteVideo5.nativeElement.srcObject = e.streams[0];
                this.remoteStreamMap.set(e.streams[0].id, e.streams[0]);
                this.mediaMap.set(e.streams[0].id, this.remoteVideo5.nativeElement.srcObject.id);
            }
        }
    }
    checkFakes = (key) => {
       return [...this.fakelist.values()].some(value => value.includes(key));
    }
    checkFakeExist = () => {
        let fake = '';
        [...this.fakelist.values()].some(value => {
             if (value.length > 0) {
                 fake = value[0];
                 return true;
             }
             return false;
        });
        return fake;
    }
    setLocalStreams = async (isAnswerer) => {
        this.yostream = false;
        for (const track of this.localStream.getVideoTracks()) {
            isAnswerer ? this.peerSenders.get(this.targetUsername).push(await this.peerList.get(this.targetUsername)
                .addTrack(track, this.localStream)) : this.peerList.get(this.targetUsername)
                .addTransceiver(track, {streams: [this.localStream]});
            // await this.setReplacement(this.targetUsername, track, this.localStream);
            console.log('ready to go localstream id --> ' + this.localStream.id + 'localtrack id --> ' + track.id +
                ' target user --> ' + this.targetUsername);
        }
    }
    setRemoteStreams = async (isAnswerer) => {
        console.log(' look! remotestreammap size --> ' + this.remoteStreamMap.size);
        if (this.remoteStreamMap.size > 0) {
            for (const stream of this.remoteStreamMap.values()) {
                console.log(' check remotestream id --> ' + stream.id);
                if (!this.checkFakes(stream.id)
                    && (!this.peerLStream.get(this.targetUsername) || !this.peerLStream.get(this.targetUsername).includes(stream.id))
                    && (!this.peerRStream.get(this.targetUsername) || !this.peerRStream.get(this.targetUsername).includes(stream.id))) {
                    if (this.peerRStream.get(this.targetUsername)) {
                        for (const el of this.peerRStream.get(this.targetUsername)) {
                            console.log('check received peerRStream elements --> ' + el);
                        }
                    }
                    if (this.peerLStream.get(this.targetUsername)) {
                        for (const el of this.peerLStream.get(this.targetUsername)) {
                            console.log('check sent peerLStream elements --> ' + el);
                        }
                    }
                    for (const track of stream.getVideoTracks()) {
                        //  await this.setReplacement(this.targetUsername, track, stream);
                        isAnswerer ? this.peerSenders.get(this.targetUsername).push(await this.peerList.get(this.targetUsername)
                            .addTrack(track, stream)) : this.peerList.get(this.targetUsername)
                            .addTransceiver(track, {streams: [stream]});
                        console.log('ready to go remotestream id --> ' + stream.id + 'localtrack id --> ' + track.id +
                            ' target user --> ' + this.targetUsername);
                    }
                }
            }
        }
    }
    setRemotePeerStreams = async (isOther) => {
        if (this.peerList.size > 1) {
            for (const peer of  [...this.peerList.keys()].filter(s => this.targetUsername !== s)) {
                this.peerConnection = this.peerList.get(peer);
                for (const stream of this.remoteStreamMap.values()) {
                    if ((!this.peerLStream.get(peer) || !this.peerLStream.get(peer).includes(stream.id)) &&
                        (!this.peerRStream.get(peer) || !this.peerRStream.get(peer).includes(stream.id))) {
                        try {
                            if (!isOther) {
                                console.log('peer --> ' + peer + ' ** stream-id --> ' + stream.id);
                                for (const track of stream.getVideoTracks()) {
                                    await this.setReplacement(peer, track, stream);
                                }
                            } else {
                              //  this.zone.run(() => setTimeout(() =>
                                    this.caSubject.next({
                                    peer: peer,
                                    fakeStream: this.fakestream,
                                    realStream: stream
                                });
                               // ));
                                // this.callDeep(peer, this.fakestream);
                                // await this.handleNegotiationNeededEvent(this.offerOptions, peer, stream.id, this.yostream)
                                //     .then(async value => {
                                //     await this.setReplacement(peer, stream.getVideoTracks()[0], stream);
                                // });
                            }
                        } catch (error) {
                            console.log('Hatali addTrack durumu peer: ' + peer + ' stream --> ' + stream.id + ' Error --> ' + error);
                        }
                    }
                }
            }
        }
    }
    callDeep = (user, stream) => {
         const mitransceiver = this.peerList.get(user).addTransceiver('video', {
             streams: [stream],
             direction: 'sendonly'
         });
        this.peerReceivers.get(user).push(mitransceiver);
        console.log('deep call init --> ' + user);
    }
    callMeUser = async (user) => {
        this.targetUsername = user;
        console.log('peer list size --> ' + this.peerList.size);
        this.createPeerConnection();
        this.createDataChannel();
        const gfs = this.checkFakeExist();
        if (gfs !== '' && this.mediaMap.get(gfs)) {
            this.shiftPlace(this.mediaMap.get(gfs));
        }
        await this.setLocalStreams(false);
        await this.setRemoteStreams(false);
        this.callDeep(this.targetUsername, this.fakestream);
        this.peerLStream.set(this.targetUsername, [this.fakestream.id]);
        this.fakelist.set(this.targetUsername, [this.fakestream.id]);
        console.log('before calling faked.id --> ' + this.fakestream.id);
    }
    callUser = async (user) => {
        this.yostream = false;
        const hrt = [];
        for (const key of this.shourenego.keys()) {
            if (this.shourenego.get(key)) {
                this.shourenego.set(key, false);
                const faked = new MediaStream([this.localStream.getVideoTracks()[0]]);
                faked.removeTrack(faked.getVideoTracks()[0]);
                hrt.push({peer: key, fakeStream: faked});
            }
        }
        if (hrt.length > 0) {
            hrt[hrt.length - 1].user = user;
            for (const hrtElement of hrt) {
                this.zone.run(() => setTimeout(() => this.caSubject.next(hrtElement)));
            }
        } else { await this.callMeUser(user); }
    }
    setReplacement = async (peer: string, track: MediaStreamTrack, stream: MediaStream) => {
        if (!this.fakelist.get(peer).includes(stream.id)) {
            console.log('Replacement --> peer is --> ' + peer + ' stream id --> ' + stream.id + ' track-id --> ' + track.id
                + ' target username --> ' + this.targetUsername);
            this.dataChannelList.get(peer).send(this.username + ',' + this.fakelist.get(peer)[0]);
            this.fakelist.get(peer).splice(this.fakelist.get(peer).indexOf(stream.id));
            await this.peerReceivers.get(peer)[this.peerReceivers.get(peer).length - 1].sender.replaceTrack(track);
            this.peerLStream.get(peer).push(stream.id);
            this.shourenego.set(peer, true);
        }
    }
    handleNegotiationNeededEvent = async (event, mypeer, isnew, streamf: boolean) => {
        try {
            this.makingOffer = true;
            console.log('offer is created by : ' + this.username + ' to ---> ' + mypeer + ' state is --> '
                + this.peerList.get(mypeer).signalingState + ' isnew -->' + isnew + ' streamf --> ' + streamf);
            const offer = await this.peerList.get(mypeer).createOffer(event);
            if (this.peerList.get(mypeer).signalingState !== 'stable') {
                console.log('not stable! offer could not be created by : ' + this.username + ' to ---> ' + mypeer + ' state is --> '
                    + this.peerList.get(mypeer).signalingState + ' isnew -->' + isnew + ' streamf --> ' + streamf);
                return;
            }
            offer.sdp = offer.sdp.replace(/(m=video.*\r\n)/g, `$1b=AS:${this.bandwidth}\r\n`);
            await this.peerList.get(mypeer).setLocalDescription(offer);
            let mystreams = '';
            if (isnew !== '') {
                const malis = [];
                if (this.peerLStream.get(mypeer)) { this.peerLStream.get(mypeer).forEach(h => malis.push(h)); }
                if (this.peerRStream.get(this.targetUsername)) {
                this.peerRStream.get(this.targetUsername).forEach(hd => {
                    if (!malis.includes(hd)) {
                        malis.push(hd);
                    }
                });
                }
                this.peerLStream.set(mypeer, malis);
                mystreams = malis.join(',');
            } else {
                mystreams = this.localStream.id;
                if (this.peerLStream.get(mypeer)) { this.peerLStream.get(mypeer).forEach(h => mystreams += ',' + h); }
                this.remoteStreamMap.forEach(yul => {
                    if (!this.peerRStream.get(mypeer) || !this.peerRStream.get(mypeer).includes(yul.id)) {
                        mystreams += ',' + yul.id;
                    }
                });
                if (this.targetUsername === mypeer && streamf) {
                    console.log(event + ' offer could not be created by : ' + this.username + ' to ---> ' + mypeer +
                        ' with streams --> ' + mystreams);
                    return;
                }
                this.peerLStream.set(mypeer, mystreams.split(','));
            }
            console.log(event + ' ---> Creating offer by : ' + this.username + ' to ---> ' + mypeer +
                ' with streams --> ' + mystreams);
            this.signalingConnection.sendToServer({
                name: this.username,
                target: mypeer,
                streams: mystreams,
                fake: this.fakestream.id,
                polite: isnew !== '',
                event: 'offer',
                sdp: this.peerList.get(mypeer).localDescription
            });
        } catch (err) {
            console.error('offer creation error', err);
        } finally {
            this.makingOffer = false;
        }
    }

    connectionOffer = async (msg) => {
        console.log(' --Received video chat offer from ' + msg.name + ' by --> ' + msg.target +
            ' with streams --> ' + msg.streams);
        this.targetUsername = msg.name;
        let hut = false;
        let mystreams = '';
        if (!this.peerList.has(this.targetUsername)) {
            hut = true;
            this.createPeerConnection();
            this.peerList.set(this.targetUsername, this.peerConnection);
            mystreams = this.localStream.id;
            this.remoteStreamMap.forEach(yul => {
                mystreams += ',' + yul.id;
            });
            this.fakelist.set(this.targetUsername, []);
            this.setDataChannel();
        } else if (this.peerLStream.get(this.targetUsername)) {
            mystreams = this.peerLStream.get(this.targetUsername).join(',');
            const gfs = this.checkFakeExist();
            if (gfs !== '' && this.mediaMap.get(gfs)) {
                this.shiftPlace(this.mediaMap.get(gfs));
            }
        }
        console.log('signaling state at the start of offer response --> ' + this.peerList.get(this.targetUsername).signalingState);
        this.peerRStream.set(this.targetUsername, msg.streams.split(','));
        this.fakelist.get(this.targetUsername).push(msg.fake);
        for (const el of this.fakelist.values()) {
            console.log('at offer fake id --> ' + el);
        }
        if (this.peerList.get(this.targetUsername).signalingState !== 'stable') {
            if (!msg.polite || this.makingOffer) {
                console.log(' ---> Answering offer by : ' + this.username + ' to ---> ' + this.targetUsername + 'rejected by not polite');
                return;
            }
            console.log(' ---> Answering offer by : ' + this.username + ' to ---> ' + this.targetUsername + 'offer called off by polite');
            zip(this.peerList.get(this.targetUsername).setLocalDescription({type: 'rollback'}),
                this.peerList.get(this.targetUsername).setRemoteDescription(new RTCSessionDescription(msg.sdp)));
        } else {
            await this.peerList.get(this.targetUsername).setRemoteDescription(new RTCSessionDescription(msg.sdp));
        }
        if (hut) {
             await this.setLocalStreams(true);
             await this.setRemoteStreams(true);  // receiver sends all remote streams to caller
        }
        mystreams += ',' + this.fakestream.id;
        await this.peerList.get(this.targetUsername).setLocalDescription(
            await this.peerList.get(this.targetUsername).createAnswer(this.offerOptions).then(answer => {
                answer.sdp = answer.sdp.replace(/(m=video.*\r\n)/g, `$1b=AS:${this.bandwidth}\r\n`);
                return answer;
            }));
        console.log('Answering by --> ' + this.username + ' to the offer from --> ' + this.targetUsername +
            ' with streams --> ' + mystreams);
        this.signalingConnection.sendToServer({
            name: this.username,
            target: this.targetUsername,
            streams: mystreams,
            fake: this.fakestream.id,
            event: 'answer',
            sdp: this.peerList.get(this.targetUsername).localDescription
        });
        console.log('signaling state at the end of offer response --> ' + this.peerList.get(this.targetUsername).signalingState);
        if (!hut && this.checkMyPeers(this.targetUsername)) { // answerer has his own peers to feed
            this.peerLStream.set(this.targetUsername, mystreams.split(','));
            if (this.peerList.size > 1) {
                console.log('While Answering to attempt feeding old friends with any of --> ' + msg.streams);
                this.yostream = false;
                await this.setRemotePeerStreams(true);
            } // receiver sends new streams to old friends
        }
        this.shourenego.set(this.targetUsername, true);
        // if (hut) {
        //     this.shourenego.set(this.targetUsername, true);
        // }
    }
    connectionAnswer = async (msg) => {
        console.log('Answer from --> ' + msg.name + ' to the original initiator --> ' + msg.target +
            ' entered with streams --> ' + msg.streams);
        // add tracks gateway event
   //     console.log('at answering mytransceiver mid --> ' + this.mytransceiver.mid);
        await this.peerList.get(msg.name)
            .setRemoteDescription(new RTCSessionDescription(msg.sdp))
            .catch(err => {
                console.log('Error in connectionAnswer');
                console.error(err);
            });
        console.log('signaling state at the start of answer response --> ' + this.peerList.get(msg.name).signalingState);
        // await this.mytransceiver.sender.replaceTrack(null);
        this.chatBoxDisabled = false;
        this.fakelist.get(msg.name).push(msg.fake);
        for (const el of this.fakelist) {
            console.log('at answering fake id --> ' + el);
        }
        let list = this.peerRStream.get(msg.name);
        if (!list) {
            list = [];
        }
        msg.streams.split(',').forEach(d => {
            if (!list.includes(d)) {
                list.push(d);
            }
        });
        if (!this.peerRStream.get(msg.name)) {
            this.peerRStream.set(msg.name, list);
        }
        if (msg.name === this.targetUsername && this.checkMyPeers(msg.name)) { // caller/offerer has his own peers to feed
            console.log('caller/offerer has his own peers to feed --> ' + msg.streams
                + ' offerer --> ' + msg.target + ' answerer --> ' + msg.name);
            this.yostream = true;
         //   this.remoteStreamMap.delete(this.mytransceiver.sender.track.id);
            await this.setRemotePeerStreams(false);
        }
    }
    checkMyPeers = (target) => {
        if (this.peerList.size > 1) {
            return [...this.peerList.keys()].filter((peer) => peer !== target)
                .some((mypeer) => {
                    return !this.peerLStream.get(mypeer) || !this.peerRStream.get(target)
                        .every((value) => this.peerLStream.get(mypeer).includes(value));
                });
        }
        return true;
    }
    ngOnDestroy(): void {
        this.onDestroy.next();
        this.onDestroy.complete();
        if (this.remoteVideo1.nativeElement.srcObject) {
            this.closeAllVideoCall().then(value => value);
        }
        this.signalingConnection.connection.close();
        if (this.localVideo.nativeElement.srcObject != null) {
            this.vidOff(this.localVideo.nativeElement.srcObject);
            this.localVideo.nativeElement.srcObject = null;
        }
    }

    handleRemoteStreams = async (value, user, mosenders) => {

        this.vidOff(this.remoteStreamMap.get(value));
        this.remoteStreamMap.delete(value);
        if (user !== '') {
            // this.peerReceivers.get(user).map(async mireceiver => {
            //     if (mosenders.includes(mireceiver.receiver.track.id)) {
            //         mireceiver.receiver.track.stop();
            //         mireceiver.receiver.track.dispatchEvent(new Event('ended'));
            //         console.log('--> Closing the track at remote --> ' + mireceiver.receiver.track.id + ' peer is --> ' + user);
            //     }
            // });
            this.removeTracksSender(mosenders);
        }
        this.peerLStream.forEach((val, key) => {
            const index = val.indexOf(value);
            if (index !== -1) {
                val.splice(index);
                this.signalingConnection.sendToServer({
                    name: this.username,
                    streams: value,
                    target: key,
                    senders: mosenders.join(','),
                    event: 'hang-up'
                });
            }
        });
        if (user !== '') {
            const index = this.peerRStream.get(user).indexOf(value);
            if (index !== -1) {
                this.peerRStream.get(user).splice(index);
            }
        }
    }
    handleHangUpMsg = async (msg) => {
        this.hangedUps.push(msg.name);
        console.log('*** Reporting hang up notification from other peer: ' + msg.name);
        this.peerReceivers.get(msg.name).map(receive => {
            console.log('--> Reporting the peer receivers --> ' + receive.receiver.track.id + ' peer is --> ' + msg.name + ' direction --> '
                + receive.currentDirection + '::mid::' + receive.mid);
            if (receive.direction === 'sendrecv') {
                console.log('Reporting sender track id --> ', receive.sender.track.id);
            }
        });
        const list = msg.senders.split(',');
        if (msg.streams !== '') {
            for (const value of msg.streams.split(',')) {
                await this.handleRemoteStreams(value, msg.name, list);
            }
        } else if (this.peerRStream.get(msg.name)) {
            const mlist = [];
            this.peerReceivers.get(msg.name).map(value => {
                if (list.includes(value.mid)) {
                    mlist.push(value.receiver.track.id);
                }
            });
            for (const value of this.peerRStream.get(msg.name)) {
                await this.handleRemoteStreams(value, '', mlist);
            }
            this.peerLStream.delete(msg.name);
            this.peerRStream.delete(msg.name);
            await this.closePeerCall(this.peerList.get(msg.name), msg.senders, mlist);
            this.peerList.get(msg.name).close();
            this.peerList.delete(msg.name);
            this.removeTracksSender(mlist);
            this.peerSenders.set(msg.name, null);
            this.peerReceivers.set(msg.name, null);
        }
    }
    removeTracksSender = (list) => {
        this.peerSenders.forEach((value, index, senders) => {
            [...value.values()].map(sender => {
                if (list.includes(sender.track.id)) {
                    console.log('--> removing the peer track by remote peer --> ' + sender.track.id + ' peer is --> ' + index);
                    this.peerList.get(index).removeTrack(sender);
                }
            });
        });
    }
    hangUpCall = async (user) => {
        this.peerLStream.get(user).filter(value => this.localStream.id !== value).forEach(value => {
            this.vidOff(this.remoteStreamMap.get(value));
            this.remoteStreamMap.delete(value);
        });
        this.peerRStream.get(user).forEach(value => {
            this.vidOff(this.remoteStreamMap.get(value));
            this.remoteStreamMap.delete(value);
        });
        this.peerLStream.delete(user);
        this.peerRStream.delete(user);
        let mysenders = '';
        for (const transceiver of this.peerList.get(user).getTransceivers()) {
            if (this.peerSenders.get(user).includes(transceiver.sender)) {
                mysenders += ',' + transceiver.mid;
            }
        }
        //   const myreceivers = this.peerReceivers.get(user).map(value => value.mid).join(',');
        await this.closePeerCall(this.peerList.get(user), '', '');
        this.peerSenders.get(user).map(sender => {
            console.log('--> removing the peer track by closer --> ' + sender.track.id + ' peer is --> ' + user);
            this.peerList.get(user).removeTrack(sender);
        });
        this.peerReceivers.get(user).map(receive => {
            console.log('--> removing the peer receivers --> ' + receive.receiver.track.id + ' peer is --> ' + user + ' direction --> '
                + receive.currentDirection + '::mid::' + receive.mid);
            if (receive.direction === 'sendrecv') {
                console.log('sender track id --> ', receive.sender.track.id);
            }
            this.peerList.get(user).removeTrack(receive.sender);
        });
        this.peerList.get(user).close();
        this.peerList.delete(user);
        this.peerSenders.set(user, null);
        this.peerReceivers.set(user, null);

        this.signalingConnection.sendToServer({
            name: this.username,
            streams: '',
            target: user,
            senders: mysenders.substring(1),
            //      receivers: myreceivers,
            event: 'hang-up'
        });
    }
    closePeerCall = async (peer, transceivers, trackids) => {
        console.log('--> Closing the peer connection');
        let mikey = '';
        if (peer !== null) {
            this.peerList.forEach((element, key) => {
                if (element === peer && this.dataChannelList.get(key)) {
                    this.dataChannelList.get(key).close();
                    this.dataChannelList.delete(key);
                    mikey = key;
                }
            });
            peer.ontrack = null;
            peer.onicecandidate = null;
            peer.oniceconnectionstatechange = null;
            peer.onsignalingstatechange = null;
            peer.onicegatheringstatechange = null;
            peer.onnegotiationneeded = null;
            // if (transceivers !== '') {
            //     const rad = transceivers.split(',');
            //     for (const transceiver of peer.getTransceivers()) {
            //         if (rad.includes(transceiver.mid)) {
            //             transceiver.receiver.track.stop();
            //             transceiver.receiver.track.dispatchEvent(new Event('ended'));
            //             console.log('--> Closing the peer connection --> ' + transceiver.receiver.track.id + ' peer is --> ' + mikey);
            //         }
            //     }
            // }
        }
    }
    closeAllVideoCall = async () => {
        console.log('Closing the call');
        for (const mapeer of this.peerList) {
            await this.closePeerCall(mapeer, '', '');
        }
        this.targetUsername = null;
        this.vidOff(this.localVideo.nativeElement.srcObject);
        this.localVideo.nativeElement.srcObject = null;
    }
    handleICECandidateEvent = event => {
        if (event.candidate) {
            this.signalingConnection.sendToServer({
                event: 'candidate',
                target: this.targetUsername,
                source: this.username,
                candidate: event.candidate
            });
        }
    }
    handleICEConnectionStateChangeEvent = async (event) => {
        console.log('ICEConnectionStateChange --> ' + this.peerConnection.iceConnectionState);
        switch (this.peerConnection.iceConnectionState) {
            case 'closed':
            case 'failed':
            case 'disconnected':
                await this.closePeerCall(this.peerConnection, '', '');
        }
    }
    handleSignalingStateChangeEvent = async (event) => {
        for (const value of this.peerList.values()) {
            console.log('SignalingStateChange --> ' + value.signalingState + ' target --> ' +
                this.targetUsername + ' senders count' + value.getSenders().length);
        }
        switch (this.peerConnection.signalingState) {
            case 'closed':
                await this.closePeerCall(this.peerConnection, '', '');
        }
    }
    handleICEGatheringStateChangeEvent = async (event) => {
        console.log('*** ICE gathering state changed to: ' + this.peerConnection.iceGatheringState + event);
    }
    sendData = (user) => {
        try {
            const date = new Date(Date.now());
            const dateString = date.toLocaleTimeString();
            const msg = '<div style="background: #e1ffc7; margin-bottom: 10px; padding: 10px">' + '<strong>'
                + this.username + '</strong> <br>' + 'PRIVATE: ' + this.textBox.nativeElement.value + '<span>' +
                '<span style="padding: 10px; float: right;">' + dateString + '</span>' + '</span></div>';
            const msgMe = '<div style="background: #e1ffc7; margin-bottom: 10px; padding: 10px">' + '<strong>'
                + user + '</strong> <br>' + 'PRIVATE-ME: ' + this.textBox.nativeElement.value + '<span>' +
                '<span style="padding: 10px; float: right;">' + dateString + '</span>' + '</span></div>';
            this.renderer.setProperty(this.privateChatBox.nativeElement, 'innerHTML',
                this.privateChatBox.nativeElement.innerHTML + msgMe);
            this.dataChannelList.get(user).send(msg);
        } catch (e) {
            console.log('Error sending');
        }
        this.textBox.nativeElement.value = '';
    }
    onDataChannelMessage = (event: MessageEvent) => {
        if (!event.data.toString().startsWith('<div')) {
            const list = event.data.toString().split(',');
            if (list[0] !== this.username) {
                this.fakelist.get(list[0]).splice(this.fakelist.get(list[0]).indexOf(list[1]));
            }
        }
        this.renderer.setProperty(this.privateChatBox.nativeElement, 'innerHTML',
            this.privateChatBox.nativeElement.innerHTML + event.data);
        this.privateChatBox.nativeElement.scrollTop = this.privateChatBox.nativeElement.scrollHeight -
            this.privateChatBox.nativeElement.clientHeight;
    }
    createDataChannel = () => {
        this.dataChannel = this.peerConnection.createDataChannel(
            this.targetUsername,
            {
                ordered: true,
                maxPacketLifeTime: 5000
            }
        );
        this.dataChannel.onclose = () => {
            console.log('The Data Channel is Closed: ', this.dataChannel.label + '--' + this.dataChannel.id);
        };
        this.dataChannel.onerror = (error) => {
            console.log('Data Channel Error:', error);
        };
        this.dataChannel.onmessage = this.onDataChannelMessage;
        this.dataChannelList.set(this.targetUsername, this.dataChannel);
    }

    private setDataChannel() {
        this.peerList.get(this.targetUsername).ondatachannel = event => {
            this.receiveChannel = event.channel;
            this.dataChannelList.set(this.targetUsername, this.receiveChannel);
            this.receiveChannel.onerror = error =>
                console.error('Data channel error', error);
            this.receiveChannel.onmessage = this.onDataChannelMessage;
            this.receiveChannel.onopen = () => {
                console.log('Data channel open');
                this.receiveChannel.send('<div style="color: chartreuse">Hello world!</div>');
            };
            this.receiveChannel.onclose = () =>
                console.log('Data channel closed: ', this.receiveChannel.label + '--' + this.receiveChannel.id);
        };
    }
    visualize(stream) {
        if (!this.audioCtx) {
            this.audioCtx = new AudioContext();
        }
        const source = this.audioCtx.createMediaStreamSource(stream);
        const analyser = this.audioCtx.createAnalyser();
        analyser.fftSize = 2048;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        source.connect(analyser);
        const draw = () => {
            const WIDTH = this.soundCanvas.nativeElement.width;
            const HEIGHT = this.soundCanvas.nativeElement.height;
            requestAnimationFrame(draw);
            analyser.getByteTimeDomainData(dataArray);
            this.canvasCtx.fillStyle = 'rgb(200, 200, 200)';
            this.canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
            this.canvasCtx.lineWidth = 2;
            this.canvasCtx.strokeStyle = 'rgb(0, 0, 0)';
            this.canvasCtx.beginPath();
            const sliceWidth = WIDTH * 1.0 / bufferLength;
            let x = 0;
            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = v * HEIGHT / 2;
                if (i === 0) {
                    this.canvasCtx.moveTo(x, y);
                } else {
                    this.canvasCtx.lineTo(x, y);
                }
                x += sliceWidth;
            }
            this.canvasCtx.lineTo(this.soundCanvas.nativeElement.width, this.soundCanvas.nativeElement.height / 2);
            this.canvasCtx.stroke();
        };
        draw();
    }
    trace(arg) {
        const now = (window.performance.now() / 1000).toFixed(3);
        console.log(now + ': ', arg);
    }

    // public fileSelectionEvent(fileInput: any) {
    //     this.fileUpload = fileInput.target.files[0];
    //     this.dataChannel.send(this.fileUpload);
    // }
    // this.mytransceiver.direction = 'sendonly';
    // this.peerList.get(peer).getTransceivers().map(async (trans) => {
    //     if (trans.direction === 'inactive' && trans.receiver.track.kind === 'video') {
    //         await trans.sender.replaceTrack(track);
    //         trans.direction = 'sendonly';
    //        // return true;
    //     }
    //    // return false;
    //  });
    // let replacement = false;
    // for (const value of this.peerList.get(peer).getSenders()) {
    //     replacement = await this.getReplacement(value, track, peer);
    // }
    // if (!replacement) {
    //    await this.peerSenders.get(peer).push(await this.peerList.get(peer).addTrack(track, stream));
    // }
    // getReplacement = async (value: RTCRtpSender, track: MediaStreamTrack, peer: string) => {
    //     if (value.track && value.track.readyState === 'ended' && value.track.id === track.id && peer !== this.targetUsername) {
    //         await value.replaceTrack(track);
    //         console.log('replaceTrack of --> ' + track.id);
    //         return true;
    //     }
    //     return false;
    // }

    // if (true) { // !this.shourenego.get(peer)

    // } else {
    //     console.log('signaling state before re-offer --> ' +
    //         this.peerList.get(this.targetUsername).signalingState);
    //     for (const track of stream.getVideoTracks()) {
    //         this.caSubject.next({peer: peer, track: track, stream: stream});
    //         // await this.peerSenders.get(peer).push(await this.peerList.get(peer)
    //         //     .addTrack(track, stream));
    //     }
    //     // await this.handleNegotiationNeededEvent(this.offerOptions, peer
    //     //     , stream.id, this.yostream);
    // }

    // for (const key of this.shourenego.keys()) {
    //     if (this.shourenego.get(key)) {
    //         setTimeout(async () => {
    //             this.shourenego.set(key, false);
    //             const faked = new MediaStream([this.localStream.getVideoTracks()[0]]);
    //             faked.removeTrack(faked.getVideoTracks()[0]);
    //             this.caSubject.next({peer: key, stream: faked});
    //             this.callDeep(key, faked);
    //             await this.handleNegotiationNeededEvent(this.offerOptions, key, faked.id, this.yostream);
    //             if (!this.peerLStream.get(key)) {
    //                 this.peerLStream.set(key, [faked.id]);
    //             } else {
    //                 this.peerLStream.get(key).push(faked.id);
    //             }
    //             this.fakelist.get(key).push(faked.id);
    //             console.log('before calling faked.id --> ' + faked.id);
    //         });
    //     }
    // }
    private shiftPlace(s: string) {
        switch (s) {
            case this.remoteVideo1.nativeElement.srcObject && this.remoteVideo1.nativeElement.srcObject.id:
                this.remoteVideo2.nativeElement.srcObject = this.remoteVideo1.nativeElement.srcObject;
                this.remoteVideo1.nativeElement.srcObject = null;
                break;
            case this.remoteVideo2.nativeElement.srcObject && this.remoteVideo2.nativeElement.srcObject.id:
                this.remoteVideo3.nativeElement.srcObject = this.remoteVideo2.nativeElement.srcObject;
                this.remoteVideo2.nativeElement.srcObject = null;
                break;
            case this.remoteVideo3.nativeElement.srcObject && this.remoteVideo3.nativeElement.srcObject.id:
                this.remoteVideo4.nativeElement.srcObject = this.remoteVideo3.nativeElement.srcObject;
                this.remoteVideo3.nativeElement.srcObject = null;
                break;
            case this.remoteVideo4.nativeElement.srcObject && this.remoteVideo4.nativeElement.srcObject.id:
                this.remoteVideo5.nativeElement.srcObject = this.remoteVideo4.nativeElement.srcObject;
                this.remoteVideo4.nativeElement.srcObject = null;
                break;
        }
    }
}
