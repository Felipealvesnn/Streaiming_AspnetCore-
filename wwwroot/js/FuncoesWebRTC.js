

const acceptCall = () => {
    var callingUserName = $('#callmodal').attr('data-cid');
    hubConnection.invoke('AnswerCall', true, caller).catch(err => console.error(err));
  
    caller = null;
    $('#callmodal').modal('hide');


};
const eventosPerl = ()=> {
    peerConnection.onicecandidate = event => {

        if (event.candidate) {

            var targetUserConnectionId = users.filter(u => u.username != user);
            console.info(`Target user: ${targetUserConnectionId[0].username}`);
            setTimeout(() => {
                hubConnection.invoke('sendData', JSON.stringify({ 'candidate': event.candidate }), targetUserConnectionId[0].connectionId).catch(err => console.error(err));
            }, 1000);
        }
    };

    peerConnection.addEventListener('connectionstatechange', event => {
        if (peerConnection.connectionState === 'connected') {
            alert("conectado")
        }
    });

}
const declineCall = () => {
    var callingUserName = $('#callmodal').attr('data-cid');
    hubConnection.invoke('AnswerCall', false, caller).catch(err => console.error(err));
    caller = null;
    $('#callmodal').modal('hide');
};

const userJoin = (username) => {
    console.info('Joining...');
    hubConnection.invoke("Join", username).catch((err) => {
        console.error(err);
    })
    $("#IdUser").text(username);
};

const callUser = (connectionId) => {
    /* caller = { "connectionId": connectionId }*/
   
    hubConnection.invoke('call', { "connectionId": connectionId });
};
const endCall = (connectionId) => {
    hubConnection.invoke('hangUp');
};

const ligarWebCam = () => {

    //peerConnection.ontrack = event => {
    //    const stream = event.streams[0];
    //    if (!remoteVideo.srcObject || remoteVideo.srcObject.id !== stream.id) {
    //        remoteVideo.srcObject = stream;
    //    }
    //}; 
    //// ,amdar a stream
    //stream.getTracks().forEach(track => {
    //    try {
    //        peerConnection.addTrack(track, stream);
    //    } catch (error) {
    //        console.error(error);
    //        // Display an error message to the user
    //        //alert('There was an error adding the audio and video track. Please try again or contact support.');
    //    }
    //});

    
    navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
    }).then(stream => {
        // Display your local video in #localVideo element
        localVideo.srcObject = stream;
        SuaStream = stream;
       
    }).catch(err => {
        console.error(err);
        // Display an error message to the user
        //alert('ACesso a camera e ao microfone é importante, recarregue a pagina, quando contectar!.');
    });

}

const ConectWebRtc = (Caller, localStream) =>{


 
    console.log('WebRTC: called initiateoffer: ');
    var connection = getConnection(partnerClientId); // // get a connection for the given partner
   
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

  
    

   
 


}