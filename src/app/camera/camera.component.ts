import { Component, ElementRef, OnInit, Renderer2, ViewChild, OnDestroy, EventEmitter } from '@angular/core';
import { from, Observable, Subject } from 'rxjs';
import { FormControl, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { SignalingConnection } from './SignalingConnection';
import { SpeechService, RecognitionResult } from '../core/speech-service';
import { map, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-camera',
    templateUrl: './camera.component.html',
    styleUrls: ['./camera.component.scss']
})
export class CameraComponent implements OnInit, OnDestroy {
    currentLanguage = 'en';
    finalTranscript: string;
    targetLanguage = 'tr';
    fileUpload: File;

    constructor(private renderer: Renderer2, private speechService: SpeechService) { }
    @ViewChild('canvas', { static: true }) canvas: ElementRef;
    @ViewChild('soundCanvas', { static: true }) soundCanvas: ElementRef;
    mediaRecorder: MediaRecorder;
    foods: Observable<MediaDeviceInfo[]>;
    videoWidth = 0;
    videoHeight = 0;

    constraints = {
        video: {
            facingMode: 'environment',
            width: { ideal: 320 },
            height: { ideal: 180 },
            frameRate: { ideal: 20, max: 30 },
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

    @ViewChild('startButton', { static: true }) startButton: ElementRef;
    @ViewChild('localVideo', { static: true }) localVideo: ElementRef;
    @ViewChild('remoteVideo1', { static: true }) remoteVideo1: ElementRef;
    @ViewChild('remoteVideo2', { static: true }) remoteVideo2: ElementRef;
    @ViewChild('remoteVideo3', { static: true }) remoteVideo3: ElementRef;
    @ViewChild('remoteVideo4', { static: true }) remoteVideo4: ElementRef;
    @ViewChild('remoteVideo5', { static: true }) remoteVideo5: ElementRef;
    @ViewChild('publicChatBox', { static: true }) publicChatBox: ElementRef;
    @ViewChild('textBox', { static: true }) textBox: ElementRef;
    @ViewChild('privateChatBox', { static: true }) privateChatBox: ElementRef;
    @ViewChild('speechTextBox', { static: true }) speechTextBox: ElementRef;

    startButtonDisabled = false;
    callButtonDisabled = true;
    hangupButtonDisabled = true;
    chatBoxDisabled = true;
    startTime: number;
    localStream: MediaStream;
    remoteStreamMap: Map<string, MediaStream> = new Map<string, MediaStream>();
    peerStreamMap: Map<string, string[]> = new Map<string, string[]>();
    pc1: RTCPeerConnection;
    pc2: RTCPeerConnection;
    offerOptions: RTCOfferOptions = {
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
    };
    watchOfferOptions: RTCOfferOptions = {
        offerToReceiveAudio: false,
        offerToReceiveVideo: false
    };
    refreshOfferOptions: RTCOfferOptions = {
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
        iceRestart: true
    };
    clientID: string;
    peerConnection: RTCPeerConnection;
    signalingConnection: SignalingConnection = null;
    userList: [];
    username: string;
    targetUsername: string;
    transceiver: RTCRtpTransceiver;
    peerList: Map<string, RTCPeerConnection> = new Map<string, RTCPeerConnection>();
    bandwidth = 128;
    dataChannel: RTCDataChannel;
    receiveChannel: RTCDataChannel;
    dataChannelList: Map<string, RTCDataChannel> = new Map<string, RTCDataChannel>();
    makingOffer = false;
    recognizing = false;
    speechMessages: Observable<RecognitionResult>;
    languages: string[] =  ['en', 'es', 'de', 'fr', 'tr'];
    private readonly onDestroy = new Subject<void>();
    joinedUser = '';
    loggedUser = '';

    gotDevices(mediaDevices: MediaDeviceInfo[]) {
        return mediaDevices.filter(value => value.kind === 'videoinput');
    }

    camOff() {
        this.vidOff(this.localVideo.nativeElement.srcObject);
    }

    vidOff(stream: MediaStream) {
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

    ngOnInit() {
        this.joinedUser = window.history.state ? window.history.state.userID : '';
        this.loggedUser = window.history.state ? window.history.state.loggedID : '';
        this.signalingConnection = new SignalingConnection(
            'busra.news:65080/ws',
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
                            this.handleSendButton(value);
                          //  this.speechService.say({lang: 'tr', text: value});
                        });
                    this.handleSendButton(this.finalTranscript);
                }
                return text;
            }));
        }
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

    stopSample(user) {
        this.hangUpCall(user);
        this.startButtonDisabled = false;
    }

    attachVideo(stream) {
        this.renderer.setProperty(this.localVideo.nativeElement, 'srcObject', stream);
        this.renderer.listen(this.localVideo.nativeElement, 'play', (event) => {
            this.videoHeight = this.localVideo.nativeElement.videoHeight;
            this.videoWidth = this.localVideo.nativeElement.videoWidth;
        });

        this.trace('Received local stream');
        this.localStream = stream;
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
        this.mediaRecorder.onstop = e => {
            const audio = new Audio();
            const blob = new Blob(this.chunks, { 'type': 'audio/ogg; codecs=opus' });
            this.chunks.length = 0;
            audio.src = window.URL.createObjectURL(blob);
            audio.load();
            audio.play();
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
    }

    onSignalingMessage = msg => {
        let text = '';
        const time = new Date(msg.date);
        const timeStr = time.toLocaleTimeString();
        switch (msg.event) {
            case 'id':
                if (!this.clientID) { this.clientID = msg.id; }
                this.userList = msg.users;
                this.setUsername();
                break;
            case 'message':
                text =  '<div style="background: #e1ffc7; margin-bottom: 10px; padding: 10px">' + '<strong>' + msg.id
                + '</strong> <br>' + msg.text + '<span>' + '<span style="padding: 10px; float: right;">' + timeStr +
                '</span>' + '</span></div>';
               // text = '(' + timeStr + ') <b>' + msg.id + '</b>: ' + msg.text + '<br>';
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
                this.connectionOffer(msg);
                break;

            case 'answer': // Callee has answered our offer
                console.log(
                    'Calling connectionAnswer from PeerConnection.onSignalingMessage'
                );
                this.connectionAnswer(msg);
                break;

            case 'candidate': // A new ICE candidate has been received
                this.newICECandidate(msg);
                break;

            case 'hang-up': // The other peer has hung up the call
                this.handleHangUpMsg(msg);
                break;
        }
        if (text.length) {
            this.renderer.setProperty(this.publicChatBox.nativeElement, 'innerHTML', this.publicChatBox.nativeElement.innerHTML + text);
            this.publicChatBox.nativeElement.scrollTop = this.publicChatBox.nativeElement.scrollHeight -
                this.publicChatBox.nativeElement.clientHeight;
        }
    }

    handleSendButton = (message) => {
        const msg = {
            text: message,
            event: 'message',
            id: this.clientID,
            room: this.loggedUser,
            date: Date.now()
        };
        this.signalingConnection.sendToServer(msg);
        this.textBox.nativeElement.value = '';
    }

    handleKey = (evt) => {
        if (evt.keyCode === 13 || evt.keyCode === 14) {
            if (!this.chatBoxDisabled) {
                this.handleSendButton(this.textBox.nativeElement.value);
            }
        }
    }

    setUsername = () => {
        if (!this.username) { this.username = this.clientID; }
    }

    gotRemoteStream(e) {
        this.trace('set RemoteStream by: ' + this.username);
        if (this.remoteStreamMap.size === 0) {
            this.remoteVideo1.nativeElement.srcObject = e.streams[0];
            this.remoteStreamMap.set(e.streams[0].id, e.streams[0]);
        }
        if (!this.remoteStreamMap.has(e.streams[0].id)) {
            if (!this.remoteVideo2.nativeElement.srcObject) {
                this.remoteVideo2.nativeElement.srcObject = e.streams[0];
                this.remoteStreamMap.set(e.streams[0].id, e.streams[0]);
            } else if (!this.remoteVideo3.nativeElement.srcObject) {
                this.remoteVideo3.nativeElement.srcObject = e.streams[0];
                this.remoteStreamMap.set(e.streams[0].id, e.streams[0]);
            } else if (!this.remoteVideo4.nativeElement.srcObject) {
                this.remoteVideo4.nativeElement.srcObject = e.streams[0];
                this.remoteStreamMap.set(e.streams[0].id, e.streams[0]);
            } else if (!this.remoteVideo5.nativeElement.srcObject) {
                this.remoteVideo5.nativeElement.srcObject = e.streams[0];
                this.remoteStreamMap.set(e.streams[0].id, e.streams[0]);
            }
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
        this.peerConnection.onnegotiationneeded = (event) => this.handleNegotiationNeededEvent(this.offerOptions, this.targetUsername);
        this.peerConnection.ontrack = this.gotRemoteStream.bind(this);
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

    sendData = (user) => {
        try {
            const date = new Date(Date.now());
            const dateString = date.toLocaleTimeString();
            const msg = '<div style="background: #e1ffc7; margin-bottom: 10px; padding: 10px">' + '<strong>'
            + this.username + '</strong> <br>' + 'PRIVATE: ' + this.textBox.nativeElement.value + '<span>' +
              '<span style="padding: 10px; float: right;">' + dateString + '</span>' + '</span></div>';
            // const msg = 'PRIVATE: ' + '(' + dateString + ') <b>from ' + this.username + '</b>:' +
            //     this.textBox.nativeElement.value + '<br>';
            const msgMe = '<div style="background: #e1ffc7; margin-bottom: 10px; padding: 10px">' + '<strong>'
            + user + '</strong> <br>' + 'PRIVATE-ME: ' + this.textBox.nativeElement.value + '<span>' +
              '<span style="padding: 10px; float: right;">' + dateString + '</span>' + '</span></div>';
            // const msgMe = 'PRIVATE-ME: ' + '(' + dateString + ') <b>to ' + user + '</b>:'
            //     + this.textBox.nativeElement.value + '<br>';
            this.renderer.setProperty(this.privateChatBox.nativeElement, 'innerHTML',
                this.privateChatBox.nativeElement.innerHTML + msgMe);
            this.dataChannelList.get(user).send(msg);
        } catch (e) {
            console.log('Error sending');
        }
        this.textBox.nativeElement.value = '';
    }

    onDataChannelMessage = (event: MessageEvent) => {
        // const buf = new Map;
        // let count;
        // if (typeof event.data !== 'string') {
        //     const data = new Uint8ClampedArray(event.data);
        //     buf.set(data, count);

        //     count += data.byteLength;
        //     console.log('count: ' + count);

        //     if (count === buf.byteLength) {
        //         console.log('Done. Rendering photo.');
        //     }
        // }
        this.renderer.setProperty(this.privateChatBox.nativeElement, 'innerHTML',
            this.privateChatBox.nativeElement.innerHTML + event.data);
        this.privateChatBox.nativeElement.scrollTop = this.privateChatBox.nativeElement.scrollHeight -
            this.privateChatBox.nativeElement.clientHeight;
    }

    callUser = async (user) => {
        this.targetUsername = user;
        this.createPeerConnection();
        this.createDataChannel();
        this.setLocalStreams();
        this.setRemoteStreams();
        this.setRemotePeerStreams();
    }

    setLocalStreams = () => {
        this.localStream.getVideoTracks().forEach(
            track => this.peerConnection.addTrack(track, this.localStream)
        );
    }

    setRemoteStreams = () => {
        if (this.remoteStreamMap.size > 0) {
            this.remoteStreamMap.forEach(stream => {
                if (!this.peerStreamMap.get(this.targetUsername) || !this.peerStreamMap.get(this.targetUsername).includes(stream.id)) {
                    stream.getVideoTracks().forEach(
                        track => this.peerConnection.addTrack(track, stream)
                    );
                }
            });
        }
    }

    setRemotePeerStreams = () => {
        if (this.peerList.size > 1) {
            this.remoteStreamMap.forEach(stream => {
                [...this.peerList.keys()].forEach(peer => {
                    if (this.targetUsername !== peer &&
                        (this.peerStreamMap.get(peer) && !this.peerStreamMap.get(peer).includes(stream.id))) {
                        try {
                            stream.getVideoTracks().forEach(track =>
                                this.peerList.get(peer).addTrack(track, stream)
                            );
                            this.handleNegotiationNeededEvent(this.offerOptions, peer);
                        } catch (error) {
                            console.log('Hata : ' + error);
                        }
                    }
                });
            });
        }
    }

    watchUser = async (user) => {
        this.targetUsername = user;
        this.createPeerConnection();
        this.createDataChannel();
        this.peerConnection.addTransceiver('video');
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

    handleNegotiationNeededEvent = async (event, mypeer) => {
        try {
         //   this.makingOffer = true;
            console.log(event + '---> Creating offer by :' + this.username + ' to --->' + this.targetUsername);
            const offer = await this.peerList.get(mypeer).createOffer(event);
            if (this.peerList.get(mypeer).signalingState !== 'stable') {
                return;
            }
            // caller's all streams
            let mystreams = this.localStream.id;
            this.remoteStreamMap.forEach(yul => mystreams += ',' + yul.id);
         //   this.peerStreamMap.set(this.targetUsername, mystreams.split(','));

            offer.sdp = offer.sdp.replace(/(m=video.*\r\n)/g, `$1b=AS:${this.bandwidth}\r\n`);
            await this.peerList.get(mypeer).setLocalDescription(offer);
            this.signalingConnection.sendToServer({
                name: this.username,
                target: mypeer,
                streams: mystreams,
                event: 'offer',
                sdp: this.peerList.get(mypeer).localDescription
            });
        } catch (err) {
        } finally {
        //    this.makingOffer = false;
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

    connectionOffer = async (msg) => {
      //  if (!this.makingOffer || this.peerList.get(msg.name).signalingState === 'stable') {
            this.targetUsername = msg.name;
            let hut = false;
            if (!this.peerList.has(this.targetUsername)) {
                hut = true;
                this.createPeerConnection();
                this.peerList.set(this.targetUsername, this.peerConnection);
            }
            // prepare receiver streams to send
            let mystreams = this.localStream.id;
            this.remoteStreamMap.forEach(yul => mystreams += ',' + yul.id);

            console.log('--Received video chat offer from ' + this.targetUsername + ' to: ' + this.username);
            this.peerStreamMap.set(this.targetUsername, msg.streams.split(','));

            const desc = new RTCSessionDescription(msg.sdp);
            await this.peerList.get(this.targetUsername).setRemoteDescription(desc);

            if (hut) {
                this.setLocalStreams();
            }
            this.setRemoteStreams();  // receiver sends all remote streams to caller
            this.setRemotePeerStreams(); // receiver sends new streams to old friends

            await this.peerList.get(this.targetUsername).setLocalDescription(
                await this.peerList.get(this.targetUsername).createAnswer(this.offerOptions).then(answer => {
                answer.sdp = answer.sdp.replace(/(m=video.*\r\n)/g, `$1b=AS:${this.bandwidth}\r\n`);
                return answer;
            }));

            this.peerList.get(this.targetUsername).ondatachannel = event => {
                this.receiveChannel = event.channel;
                this.dataChannelList.set(this.targetUsername, this.receiveChannel);
                this.receiveChannel.onerror = error =>
                    console.error('Data channel error', error);
                this.receiveChannel.onmessage = this.onDataChannelMessage;
                this.receiveChannel.onopen = () => {
                    console.log('Data channel open');
                    this.receiveChannel.send('Hello world!');
                };
                this.receiveChannel.onclose = () =>
                     console.log('Data channel closed: ', this.receiveChannel.label + '--' + this.receiveChannel.id);
            };
            console.log('connectionOffer sends connection-answer me: ' + this.username);
            this.signalingConnection.sendToServer({
                name: this.username,
                target: this.targetUsername,
                streams: mystreams,
                event: 'answer',
                sdp: this.peerList.get(this.targetUsername).localDescription
            });
        // } else { await Promise.all([
        //     this.peerConnection.setLocalDescription({type: 'rollback'}),
        //     this.peerConnection.setRemoteDescription(new RTCSessionDescription(msg.sdp))
        //   ]); }
    }

    connectionAnswer = async (msg) => {
        console.log('connectionAnswer entered');
        await this.peerList.get(msg.name)
            .setRemoteDescription(new RTCSessionDescription(msg.sdp))
            .catch(err => {
                console.log('Error in connectionAnswer');
                console.error(err);
            });
        this.chatBoxDisabled = false;
        this.peerStreamMap.set(msg.name, msg.streams.split(','));
      //  this.peerStreamMap.set(msg.target, list);
        this.setRemotePeerStreams();
    }

    ngOnDestroy(): void {
        this.onDestroy.next();
        this.onDestroy.complete();
        if (this.remoteVideo1.nativeElement.srcObject) {
            this.closeAllVideoCall();
        }
        this.signalingConnection.connection.close();
        if (this.localVideo.nativeElement.srcObject != null) {
            this.vidOff(this.localVideo.nativeElement.srcObject);
            this.localVideo.nativeElement.srcObject = null;
        }
    }

    handleHangUpMsg = (msg) => {
        console.log('*** Received hang up notification from other peer: ' + msg.name);
        this.peerStreamMap.get(msg.name).forEach(value => {
            this.vidOff(this.remoteStreamMap.get(value));
            this.remoteStreamMap.delete(value);
        });
        this.peerStreamMap.delete(msg.name);
        this.closePeerCall(this.peerList.get(msg.name));
    }

    hangUpCall = (user) => {
        this.peerStreamMap.get(user).forEach(value => {
            this.vidOff(this.remoteStreamMap.get(value));
            this.remoteStreamMap.delete(value);
        });
        this.peerStreamMap.delete(user);
        this.remoteStreamMap.delete(user);
        this.closePeerCall(this.peerList.get(user));
        this.signalingConnection.sendToServer({
            name: this.username,
            target: user,
            event: 'hang-up'
        });
    }
    closePeerCall = (peer) => {
       // console.log('--> Closing the peer connection');
        let mikey = '';
        this.peerList.forEach((element, key) => {
            if (element === peer) {
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
        peer.getTransceivers().forEach(transceiver => {
            transceiver.receiver.track.stop();
            // transceiver.stop();
        });
        peer.close();
        this.peerList.delete(mikey);
        peer = null;
    }
    closeAllVideoCall = () => {
        console.log('Closing the call');
        this.peerList.forEach(mapeer => {
           this.closePeerCall(mapeer);
        });
        this.targetUsername = null;
        this.vidOff(this.localVideo.nativeElement.srcObject);
        this.localVideo.nativeElement.srcObject = null;
    }

    handleICEConnectionStateChangeEvent = event => {
        switch (this.peerConnection.iceConnectionState) {
            case 'closed':
            case 'failed':
            case 'disconnected':
                this.closePeerCall(this.peerConnection);
        }
    }

    handleSignalingStateChangeEvent = event => {
        switch (this.peerConnection.signalingState) {
            case 'closed':
                this.closePeerCall(this.peerConnection);
        }
    }

    handleICEGatheringStateChangeEvent = (event) => {
        console.log('*** ICE gathering state changed to: ' + this.peerConnection.iceGatheringState);
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
}
