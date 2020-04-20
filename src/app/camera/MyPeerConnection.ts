// import { SignalingConnection } from './SignalingConnection';
// import { async } from '@angular/core/testing';

// export class MyPeerConnection {
//     onClose: any;
//     localStream: any;
//     username: string;
//     targetUsername: string;
//     dataChannelLabel: string;
//     peerConnection: RTCPeerConnection;
//     dataChannel: RTCDataChannel;
//     signalingConnection: SignalingConnection;
//     msgUnlisten: any;

//     constructor(signalingConnection: SignalingConnection,
//         onClose: any,
//         localStream: MediaStream,
//         username: string,
//         targetUsername: string,
//         dataChannelLabel: string
//     ) {
//         this.signalingConnection = signalingConnection;
//         this.onClose = onClose;
//         this.username = username;
//         this.localStream = localStream;
//         this.targetUsername = targetUsername;
//         this.dataChannelLabel = dataChannelLabel;
//         this.peerConnection = new RTCPeerConnection({
//             iceServers: [
//                 {
//                     urls: 'stun:stun.l.google.com:19302'
//                 }
//             ]
//         });
//         this.peerConnection.onicecandidate = this.handleICECandidateEvent;
//         this.peerConnection.oniceconnectionstatechange = this.handleICEConnectionStateChangeEvent;
//         this.peerConnection.onicegatheringstatechange = this.handleICEGatheringStateChangeEvent;
//         this.peerConnection.onsignalingstatechange = this.handleSignalingStateChangeEvent;
//         this.peerConnection.onnegotiationneeded = this.handleNegotiationNeededEvent;

//         this.localStream.getTracks().forEach(
//             track => this.peerConnection.addTrack(track, this.localStream)
//          );
//         console.log('peerconnection created', this.peerConnection);
//     }
//     handleICEGatheringStateChangeEvent = (event) => {
//         console.log('*** ICE gathering state changed to: ' + this.peerConnection.iceGatheringState);
//       }
//     handleICECandidateEvent = event => {
//         if (event.candidate) {
//             this.signalingConnection.sendToServer({
//                 type: 'new-ice-candidate',
//                 target: this.targetUsername,
//                 candidate: event.candidate
//             });
//         }
//     }
//     handleNegotiationNeededEvent = async(event) => {
//         try {
//             const offer = await this.peerConnection.createOffer();

//             if (this.peerConnection.signalingState !== 'stable') {
//               return;
//             }
//             await this.peerConnection.setLocalDescription(offer);

//             this.signalingConnection.sendToServer({
//               name: this.username,
//               target: this.targetUsername,
//               type: 'video-offer',
//               sdp: this.peerConnection.localDescription
//             });
//           } catch (err) {
//           }
//     }
//     handleICEConnectionStateChangeEvent = event => {
//         switch (this.peerConnection.iceConnectionState) {
//             case 'closed':
//             case 'failed':
//             case 'disconnected':
//                 this.close();
//         }
//     }

//     handleSignalingStateChangeEvent = event => {
//         switch (this.peerConnection.signalingState) {
//             case 'closed':
//                 this.close();
//         }
//     }

//     offerConnection = () => {
//         const { username, targetUsername } = this;

//         console.log('creating offer');
//         this.peerConnection
//             .createOffer()
//             .then(offer => {
//                 console.log('attempting local description', offer);
//                 console.log('state', this.peerConnection.signalingState);

//                 return this.peerConnection.setLocalDescription(offer);
//             })
//             .then(() => {
//                 console.log(
//                     'Sending offer to',
//                     targetUsername,
//                     'from',
//                     username
//                 );
//                 this.signalingConnection.sendToServer({
//                     name: username,
//                     target: targetUsername,
//                     type: 'video-offer',
//                     sdp: this.peerConnection.localDescription
//                 });
//             })
//             .catch(err => {
//                 console.log('Error in handleNegotiationNeededEvent');
//                 console.error(err);
//             });
//     }

//     connectionOffer = ( msg ) => {

//         const { username, targetUsername } = this;
//         this.peerConnection
//             .setRemoteDescription(new RTCSessionDescription(msg.sdp))
//             .then(() => {
//                  this.localStream.getTracks().forEach(
//                      track => this.peerConnection.addTrack(track, this.localStream)
//                  );
//                 return this.peerConnection.createAnswer();
//             })
//             .then(answer => {
//                 return this.peerConnection.setLocalDescription(answer);
//             })
//             .then(() => {
//                 console.log('connectionOffer sends connection-answer');
//                 this.signalingConnection.sendToServer({
//                     name: username,
//                     targetUsername: targetUsername,
//                     type: 'video-answer',
//                     sdp: this.peerConnection.localDescription
//                 });
//             })
//             .catch(err => {
//                 console.log('Error in connectionOffer');
//                 console.error(err);
//             });
//     }

//     connectionAnswer = ( msg ) => {
//         console.log('connectionAnswer entered');
//         this.peerConnection
//             .setRemoteDescription(new RTCSessionDescription(msg.sdp))
//             .catch(err => {
//                 console.log('Error in connectionAnswer');
//                 console.error(err);
//             });
//     }

//     newICECandidate = async({ candidate }) => {
//        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
//     }

//     onSignalingMessage = msg => {
//         switch (msg.type) {
//             case 'video-offer': // our offer
//                 console.log(
//                     'Calling connectionOffer from PeerConnection.onSignalingMessage'
//                 );
//                 this.connectionOffer(msg);
//                 break;

//             case 'video-answer': // Callee has answered our offer
//                 console.log(
//                     'Calling connectionAnswer from PeerConnection.onSignalingMessage'
//                 );
//                 this.connectionAnswer(msg);
//                 break;

//             case 'new-ice-candidate': // A new ICE candidate has been received
//                 this.newICECandidate(msg);
//                 break;

//             case 'hang-up': // The other peer has hung up the call
//                 this.close();
//                 break;
//         }
//     }

//     onDataChannelMessage = msg => {
//         console.log('Data channel message received', msg);
//     }

//     close = () => {
//         this.peerConnection.close();
//         this.peerConnection = null;

//         this.onClose();
//     }
// }
// getName(pc) {
    //     return (pc === this.pc1) ? 'pc1' : 'pc2';
    // }
    // const sender = peer.getSenders().find((s) => s.track.kind === videoTrack.kind);
    // sender.setStreams(this.localStream, stream);
    // await sender.replaceTrack(videoTrack);
    // getOtherPc(pc) {
    //     return (pc === this.pc1) ? this.pc2 : this.pc1;
    // }
    // gotStream(stream) {
    //     this.trace('Received local stream');
    //     this.localVideo.nativeElement.srcObject = stream;
    //     this.localStream = stream;
    //     this.callButtonDisabled = false;
    // }
    // start() {
    //     this.trace('Requesting local stream');
    //     this.startButtonDisabled = true;
    //     navigator.mediaDevices.getUserMedia({
    //         audio: true,
    //         video: true
    //     })
    //         .then(this.gotStream.bind(this))
    //         .catch(function (e) {
    //             alert('getUserMedia() error: ' + e.name);
    //         });
    // }

    // call() {
    //     this.callButtonDisabled = true;
    //     this.hangupButtonDisabled = false;
    //     this.trace('Starting call');
    //     this.startTime = window.performance.now();
    //     const videoTracks = this.localStream.getVideoTracks();
    //     const audioTracks = this.localStream.getAudioTracks();
    //     if (videoTracks.length > 0) {
    //         this.trace('Using video device: ' + videoTracks[0].label);
    //     }
    //     if (audioTracks.length > 0) {
    //         this.trace('Using audio device: ' + audioTracks[0].label);
    //     }
    //     // const servers = {
    //     //     iceServers: [{
    //     //         urls: 'stun:stun.l.google.com:19302'
    //     //     }]
    //     // };
    //     // this.pc1 = new RTCPeerConnection(servers);
    //     // this.trace('Created local peer connection object pc1');
    //     // this.pc1.onicecandidate = e => {
    //     //     this.onIceCandidate(this.pc1, e);
    //     // };
    //     // this.pc2 = new RTCPeerConnection(servers);
    //     // this.trace('Created remote peer connection object pc2');
    //     // this.pc2.onicecandidate = e => {
    //     //     this.onIceCandidate(this.pc2, e);
    //     // };
    //     // this.pc1.oniceconnectionstatechange = e => {
    //     //     this.onIceStateChange(this.pc1, e);
    //     // };
    //     // this.pc2.oniceconnectionstatechange = e => {
    //     //     this.onIceStateChange(this.pc2, e);
    //     // };
    //     // this.pc2.ontrack = this.gotRemoteStream.bind(this);

    //     // this.localStream.getTracks().forEach(
    //     //     track => {
    //     //         this.pc1.addTrack(
    //     //             track,
    //     //             this.localStream
    //     //         );
    //     //     }
    //     // );
    //     // this.trace('Added local stream to pc1');

    //     // this.trace('pc1 createOffer start');
    //     // this.pc1.createOffer(
    //     //     this.offerOptions
    //     // ).then(
    //     //     this.onCreateOfferSuccess.bind(this),
    //     //     this.onCreateSessionDescriptionError.bind(this)
    //     // );
    // }
    // onCreateSessionDescriptionError(error) {
    //     this.trace('Failed to create session description: ' + error.toString());
    // }
    // onCreateOfferSuccess(desc) {
    //     this.trace('Offer from pc1\n' + desc.sdp);
    //     this.trace('pc1 setLocalDescription start');
    //     this.pc1.setLocalDescription(desc).then(
    //         () => {
    //             this.onSetLocalSuccess(this.pc1);
    //         },
    //         this.onSetSessionDescriptionError.bind(this)
    //     );
    //     this.trace('pc2 setRemoteDescription start');
    //     this.pc2.setRemoteDescription(desc).then(
    //         () => {
    //             this.onSetRemoteSuccess(this.pc2);
    //         },
    //         this.onSetSessionDescriptionError.bind(this)
    //     );
    //     this.trace('pc2 createAnswer start');
    //     // Since the 'remote' side has no media stream we need
    //     // to pass in the right constraints in order for it to
    //     // accept the incoming offer of audio and video.
    //     this.pc2.createAnswer().then(
    //         this.onCreateAnswerSuccess.bind(this),
    //         this.onCreateSessionDescriptionError.bind(this)
    //     );
    // }

    // onSetLocalSuccess(pc) {
    //     this.trace(this.getName(pc) + ' setLocalDescription complete');
    // }

    // onSetRemoteSuccess(pc) {
    //     this.trace(this.getName(pc) + ' setRemoteDescription complete');
    // }

    // onSetSessionDescriptionError(error) {
    //     this.trace('Failed to set session description: ' + error.toString());
    // }

    // onCreateAnswerSuccess(desc) {
    //     this.trace('Answer from pc2:\n' + desc.sdp);
    //     this.trace('pc2 setLocalDescription start');
    //     this.pc2.setLocalDescription(desc).then(
    //         () => {
    //             this.onSetLocalSuccess(this.pc2);
    //         },
    //         this.onSetSessionDescriptionError.bind(this)
    //     );
    //     this.trace('pc1 setRemoteDescription start');
    //     this.pc1.setRemoteDescription(desc).then(
    //         () => {
    //             this.onSetRemoteSuccess(this.pc1);
    //         },
    //         this.onSetSessionDescriptionError.bind(this)
    //     );
    // }

    // onIceCandidate(pc, event) {
    //     this.getOtherPc(pc).addIceCandidate(event.candidate)
    //         .then(
    //             () => {
    //                 this.onAddIceCandidateSuccess(pc);
    //             },
    //             (err) => {
    //                 this.onAddIceCandidateError(pc, err);
    //             }
    //         );
    //     this.trace(this.getName(pc) + ' ICE candidate: \n' + (event.candidate ?
    //         event.candidate.candidate : '(null)'));
    // }

    // onAddIceCandidateSuccess(pc) {
    //     this.trace(this.getName(pc) + ' addIceCandidate success');
    // }

    // onAddIceCandidateError(pc, error) {
    //     this.trace(this.getName(pc) + ' failed to add ICE Candidate: ' + error.toString());
    // }

    // onIceStateChange(pc, event) {
    //     if (pc) {
    //         this.trace(this.getName(pc) + ' ICE state: ' + pc.iceConnectionState);
    //         console.log('ICE state change event: ', event);
    //     }
    // }

    // hangup() {
    //     this.trace('Ending call');
    //     this.pc1.close();
    //     this.pc2.close();
    //     this.pc1 = null;
    //     this.pc2 = null;
    //     this.hangupButtonDisabled = true;
    //     this.callButtonDisabled = false;
    // }
        //    this.signalingConnection.sendToServer({
        //        name: this.username,
        //        date: Date.now(),
        //        id: this.clientID,
        //        event: 'username'
        //    });
