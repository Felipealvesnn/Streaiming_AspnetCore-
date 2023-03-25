const getConnection = (partnerClientId) => {
    console.log("WebRTC: called getConnection");
    if (connections[partnerClientId]) {
        console.log("WebRTC: connections partner client exist");
        return connections[partnerClientId];
    }
    else {
        console.log("WebRTC: initialize new connection");
        return initializeConnection(partnerClientId)
    }
}

const initializeConnection = (partnerClientId) => {
    console.log('WebRTC: Initializing connection...');
    //console.log("Received Param for connection: ", partnerClientId);

    var connection = new RTCPeerConnection(peerConnectionConfig);

    connection.addEventListener('connectionstatechange', event => {
        if (connection.connectionState === 'connected') {
            alert("Conectado")

        }
    });


    connection.onicecandidate = evt => callbackIceCandidate(evt, connection, partnerClientId); // ICE Candidate Callback
    //connection.onnegotiationneeded = evt => callbackNegotiationNeeded(connection, evt); // Negotiation Needed Callback
    connection.onaddstream = evt => callbackAddStream(connection, evt); // Add stream handler callback
    connection.onremovestream = evt => callbackRemoveStream(connection, evt); // Remove stream handler callback

    connections[partnerClientId] = connection; // Store away the connection based on username
    //console.log(connection);
    return connection;
}

const callbackIceCandidate = (evt, connection, partnerClientId) => {
    console.log("WebRTC: Ice Candidate callback");
    //console.log("evt.candidate: ", evt.candidate);
    if (evt.candidate) {// Found a new candidate
        console.log('WebRTC: new ICE candidate');
        //console.log("evt.candidate: ", evt.candidate);
        sendHubSignal(JSON.stringify({ "candidate": evt.candidate }), partnerClientId);
    } else {
        // Null candidate means we are done collecting candidates.
        console.log('WebRTC: ICE candidate gathering complete');
        sendHubSignal(JSON.stringify({ "candidate": null }), partnerClientId);
    }
}
const callbackAddStream = (connection, evt) => {
    console.log('WebRTC: called callbackAddStream');

    // Bind the remote stream to the partner window
    //var otherVideo = document.querySelector('.video.partner');
    //attachMediaStream(otherVideo, evt.stream); // from adapter.js
    attachMediaStream(evt);
}

attachMediaStream = (e) => {
    //console.log(e);
    console.log("OnPage: called attachMediaStream");
    var partnerAudio = document.querySelector('.audio.partner');
    if (partnerAudio.srcObject !== e.stream) {
        partnerAudio.srcObject = e.stream;
        console.log("OnPage: Attached remote stream");
    }
};

const callbackRemoveStream = (connection, evt) => {
    console.log('WebRTC: removing remote stream from partner window');
    // Clear out the partner window
    var otherAudio = document.querySelector('.audio.partner');
    otherAudio.src = null;
}

const initiateOffer = (partnerClientId, stream) => {
    console.log('WebRTC: called initiateoffer: ');
    var connection = getConnection(partnerClientId); // // get a connection for the given partner


    //console.log('initiate Offer stream: ', stream);
    //console.log("offer connection: ", connection);
    connection.addStream(stream);// add our audio/video stream
    console.log("WebRTC: Added local stream");

    connection.createOffer().then(offer => {
        console.log('WebRTC: created Offer: ');
        console.log('WebRTC: Description after offer: ', offer);
        connection.setLocalDescription(offer).then(() => {
            console.log('WebRTC: set Local Description: ');
            console.log('connection before sending offer ', connection);
            setTimeout(() => {
                sendHubSignal(JSON.stringify({ "sdp": connection.localDescription }), partnerClientId);
            }, 1000);
        }).catch(err => console.error('WebRTC: Error while setting local description', err));
    }).catch(err => console.error('WebRTC: Error while creating offer', err));

    //connection.createOffer((desc) => { // send an offer for a connection
    //    console.log('WebRTC: created Offer: ');
    //    console.log('WebRTC: Description after offer: ', JSON.stringify(desc));
    //    connection.setLocalDescription(desc, () => {
    //        console.log('WebRTC: Description after setting locally: ', JSON.stringify(desc));
    //        console.log('WebRTC: set Local Description: ');
    //        console.log('connection.localDescription: ', JSON.stringify(connection.localDescription));
    //        sendHubSignal(JSON.stringify({ "sdp": connection.localDescription }), partnerClientId);
    //    });
    //}, errorHandler);
}

sendHubSignal = (candidate, partnerClientId) => {
    console.log('candidate', candidate);
    console.log('SignalR: called sendhubsignal ');
    wsconn.invoke('sendSignal', candidate, partnerClientId).catch(errorHandler);
};

const receivedCandidateSignal = (connection, partnerClientId, candidate) => {
    //console.log('candidate', candidate);
    //if (candidate) {
    console.log('WebRTC: adding full candidate');
    connection.addIceCandidate(new RTCIceCandidate(candidate), () => console.log("WebRTC: added candidate successfully"), () => console.log("WebRTC: cannot add candidate"));
    //} else {
    //    console.log('WebRTC: adding null candidate');
    //   connection.addIceCandidate(null, () => console.log("WebRTC: added null candidate successfully"), () => console.log("WebRTC: cannot add null candidate"));
    //}
}

const newSignal = (partnerClientId, data) => {
    console.log('WebRTC: called newSignal');
    //console.log('connections: ', connections);

    var signal = JSON.parse(data);
    var connection = getConnection(partnerClientId);
    //console.log("signal: ", signal);
    //console.log("signal: ", signal.sdp || signal.candidate);
    //console.log("partnerClientId: ", partnerClientId);
    console.log("connection: ", connection);

    // Route signal based on type
    if (signal.sdp) {
        console.log('WebRTC: sdp signal');
        receivedSdpSignal(connection, partnerClientId, signal.sdp);
    } else if (signal.candidate) {
        console.log('WebRTC: candidate signal');
        receivedCandidateSignal(connection, partnerClientId, signal.candidate);
    } else {
        console.log('WebRTC: adding null candidate');
        connection.addIceCandidate(null, () => console.log("WebRTC: added null candidate successfully"), () => console.log("WebRTC: cannot add null candidate"));
    }
}

const receivedSdpSignal = (connection, partnerClientId, sdp) => {
    console.log('connection: ', connection);
    console.log('sdp', sdp);
    console.log('WebRTC: called receivedSdpSignal');
    console.log('WebRTC: processing sdp signal');
    connection.setRemoteDescription(new RTCSessionDescription(sdp), () => {
        console.log('WebRTC: set Remote Description');
        if (connection.remoteDescription.type == "offer") {
            console.log('WebRTC: remote Description type offer');
            connection.addStream(localStream);
            console.log('WebRTC: added stream');
            connection.createAnswer().then((desc) => {
                console.log('WebRTC: create Answer...');
                connection.setLocalDescription(desc, () => {
                    console.log('WebRTC: set Local Description...');
                    console.log('connection.localDescription: ', connection.localDescription);
                    //setTimeout(() => {
                    sendHubSignal(JSON.stringify({ "sdp": connection.localDescription }), partnerClientId);
                    //}, 1000);
                }, errorHandler);
            }, errorHandler);
        } else if (connection.remoteDescription.type == "answer") {
            console.log('WebRTC: remote Description type answer');
        }
    }, errorHandler);
}




wsconn.on('receiveSignal', (signalingUser, signal) => {
 
    newSignal(signalingUser.connectionId, signal);
});


const errorHandler = (error) => {
    if (error.message)
        alertify.alert('<h4>Error Occurred</h4></br>Error Info: ' + JSON.stringify(error.message));
    else
        alertify.alert('<h4>Error Occurred</h4></br>Error Info: ' + JSON.stringify(error));

    consoleLogger(error);
};