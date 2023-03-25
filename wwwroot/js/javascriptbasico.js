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
const limparChat = () => {
    $('#Chatmesseger div.chatHub').remove();
    $('#divChat').hide()

}
const callUser = (connectionId) => {
    /* caller = { "connectionId": connectionId }*/

   wsconn.invoke('call', { "connectionId": connectionId });
};
const endCall = (connectionId) => {
   
  
    wsconn.invoke('hangUp');
};

const closeConnection = (partnerClientId) => {
    console.log("WebRTC: called closeConnection ");
    var connection = connections[partnerClientId];

    if (connection) {
        // Let the user know which streams are leaving
        // todo: foreach connection.remoteStreams -> onStreamRemoved(stream.id)
        partnerAudio.srcObject =null

        // Close the connection
        connection.close();
        delete connections[partnerClientId]; // Remove the property
    }
}



const webrtcConstraints = { audio: true, video: true };

const initializeUserMedia = async () => {
    try {
        console.log('WebRTC: InitializeUserMedia');
        const stream = await navigator.mediaDevices.getUserMedia(webrtcConstraints);
        callbackUserMediaSuccess(stream);
    } catch (error) {
        console.error('WebRTC: InitializeUserMedia error', error);
        const audioOnlyConstraints = { audio: true, video: false };
        const audioOnlyStream = await navigator.mediaDevices.getUserMedia(audioOnlyConstraints);
        callbackUserMediaSuccess(audioOnlyStream);
        // Call error handler here or display an error message to the user
    }
};

const callbackUserMediaSuccess = (stream) => {
    console.log('WebRTC: got media stream');
    localStream = stream;

    const audioTracks = localStream.getAudioTracks();
    const videoTracks = localStream.getVideoTracks();

    if (audioTracks.length > 0) {
        console.log(`Using Audio device: ${audioTracks[0].label}`);
    }

    if (videoTracks.length === 0 && audioTracks.length > 0) {
        console.log('MediaStream only has audio');

        // Create a new MediaStream with only audio tracks
        const audioStream = new MediaStream(audioTracks);
        localStream = audioStream;
    }

    // Use the localStream for communication
    // ...
};
