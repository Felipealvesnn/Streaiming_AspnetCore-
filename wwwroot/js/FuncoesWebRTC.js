

const acceptCall = () => {
    var callingUserName = $('#callmodal').attr('data-cid');
    hubConnection.invoke('AnswerCall', true, caller).catch(err => console.error(err));
    ConectWebRtc(caller)
  
    caller = null;
    $('#callmodal').modal('hide');


};

const eventosPerl = () => {
    peerConnection.onicecandidate = event => {

        if (event.candidate) {

            var targetUserConnectionId = users.filter(u => u.username != user);
            console.info(`Target user: ${targetUserConnectionId[0].username}`);
           
                hubConnection.invoke('sendData', JSON.stringify({ 'candidate': event.candidate }), targetUserConnectionId[0].connectionId).catch(err => console.error(err));
         
        }
    };

    peerConnection.addEventListener('connectionstatechange', event => {
        if (peerConnection.connectionState === 'connected') {
            alert("conectado")
        }
    });

    // digo q se receber video, colocar na div "remoteVideo"
    peerConnection.ontrack = event => {
        const stream = event.streams[0];
        //if (!remoteVideo.srcObject || remoteVideo.srcObject.id !== stream.id) {

        //}
        remoteVideo.srcObject = stream;
    };
    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            var targetUserConnectionId = caller;
            console.info(`Target user: ${targetUserConnectionId.username}`);
            hubConnection.invoke('sendData', JSON.stringify({ 'candidate': event.candidate }), targetUserConnectionId.connectionId).catch(err => console.error(err));
        }
    };

    peerConnection.addEventListener('connectionstatechange', event => {
        if (peerConnection.connectionState === 'connected') {
            alert("Conectado")
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
    navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
    }).then(stream => {
        // Display your local video in #localVideo element
        localVideo.srcObject = stream;
        // Add your stream to be sent to the connecting peer
        stream.getTracks().forEach(track => {
            try {
                peerConnection.addTrack(track, stream);
            } catch (error) {
                console.error(error);
                // Display an error message to the user
                //alert('There was an error adding the audio and video track. Please try again or contact support.');
            }
        });
    }).catch(err => {
        console.error(err);
        // Display an error message to the user
        //alert('ACesso a camera e ao microfone é importante, recarregue a pagina, quando contectar!.');
    });

}

const ConectWebRtc = (Caller) =>{


    //peerConnection.onicecandidate = event => {
    //    if (event.candidate) {
    //        var targetUserConnectionId = Caller;
    //        console.info(`Target user: ${targetUserConnectionId.username}`);
    //        hubConnection.invoke('sendData', JSON.stringify({ 'candidate': event.candidate }), targetUserConnectionId.connectionId).catch(err => console.error(err));
    //    }
    //};
    peerConnection =  new RTCPeerConnection(configuration)
    eventosPerl()
        console.info('Ligacaoo WebRtc ...');
      
            peerConnection.createOffer()
                .then((description) => {
                    peerConnection.setLocalDescription(
                        description,
                        () => {
                            var targetUserConnectionId = Caller;
                            setTimeout(() => {
                                hubConnection.invoke('sendData', JSON.stringify({ 'sdp': peerConnection.localDescription }), targetUserConnectionId.connectionId).catch(err => console.error(err));
                            }, 1000);
                        },
                        (err) => console.info(err)
                    );
                })
                .catch(err => console.error(err));  
    

   
 


}