const acceptCall = () => {
    var callingUserName = $('#callmodal').attr('data-cid');
   wsconn.invoke('AnswerCall', true, caller).catch(err => console.error(err));
    $('#divChat').show()
    initiateOffer(caller.connectionId, localStream)
    caller = null;
    $('#callmodal').modal('hide');


};

const declineCall = () => {
    var callingUserName = $('#callmodal').attr('data-cid');
   wsconn.invoke('AnswerCall', false, caller).catch(err => console.error(err));
    caller = null;
    $('#callmodal').modal('hide');
};

const userJoin = (username) => {
    console.info('Joining...');
   wsconn.invoke("Join", username).catch((err) => {
        console.error(err);
    })
    $("#IdUser").text(username);
};

const callUser = (connectionId) => {
    /* caller = { "connectionId": connectionId }*/

   wsconn.invoke('call', { "connectionId": connectionId });
};
const endCall = (connectionId) => {
   wsconn.invoke('hangUp');
};

const callbackUserMediaSuccess = (stream) => {
    console.log("WebRTC: got media stream");
    localStream = stream;

    const audioTracks = localStream.getAudioTracks();
    if (audioTracks.length > 0) {
        console.log(`Using Audio device: ${audioTracks[0].label}`);
    }
};

const initializeUserMedia = () => {
    //console.log('WebRTC: InitializeUserMedia: ');
    //navigator.getUserMedia(webrtcConstraints, callbackUserMediaSuccess, errorHandler);

    navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
    }).then(stream => {
        // Display your local video in #localVideo element
        localVideo.srcObject = stream;
        localStream = stream;
    }, (err) => console.error(err));
};