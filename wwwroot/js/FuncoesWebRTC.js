

const acceptCall = () => {
    var callingUserName = $('#callmodal').attr('data-cid');
    hubConnection.invoke('AnswerCall', true, caller).catch(err => console.error(err));
    ligarWebCam();
    ConectWebRtc(caller)
    caller = null;
    $('#callmodal').modal('hide');


};

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
    ligarWebCam();
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



  
    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            var targetUserConnectionId = Caller;
            console.info(`Target user: ${targetUserConnectionId.username}`);
            hubConnection.invoke('sendData', JSON.stringify({ 'candidate': event.candidate }), targetUserConnectionId.connectionId).catch(err => console.error(err));
        }
    };
   
        console.info('Ligacaoo WebRtc ...');
        peerConnection.onnegotiationneeded = () => {
            peerConnection.createOffer()
                .then((description) => {
                    peerConnection.setLocalDescription(
                        description,
                        () => {
                            var targetUserConnectionId = Caller;
                            hubConnection.invoke('sendData', JSON.stringify({ 'sdp': peerConnection.localDescription }), targetUserConnectionId.connectionId).catch(err => console.error(err));
                        },
                        (err) => console.info(err)
                    );
                })
                .catch(err => console.error(err));  
    }

   
 


}