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
   
    closeConnection(connectionId);
    wsconn.invoke('hangUp');
};

const closeConnection = (partnerClientId) => {
    console.log("WebRTC: called closeConnection ");
    var connection = connections[partnerClientId];

    if (connection) {
        // Let the user know which streams are leaving
        // todo: foreach connection.remoteStreams -> onStreamRemoved(stream.id)
       

        // Close the connection
        connection.close();
        delete connections[partnerClientId]; // Remove the property
    }
}


const callbackUserMediaSuccess = (stream) => {
    console.log("WebRTC: got media stream");
    localStream = stream;

    const audioTracks = localStream.getAudioTracks();
    if (audioTracks.length > 0) {
        console.log(`Using Audio device: ${audioTracks[0].label}`);
    }
};

const initializeUserMedia = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        // Informe ao usu�rio que a funcionalidade n�o � suportada em seu navegador
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        });
        localVideo.srcObject = stream;
        localStream = stream;
    } catch (err) {
        // Se o usu�rio negar o acesso ao dispositivo de �udio/v�deo, mostre uma mensagem de erro adequada
        console.error('N�o foi poss�vel acessar o dispositivo de �udio/v�deo', err);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false,
            });
            localVideo.srcObject = stream;
            localStream = stream;
        } catch (err) {
            // Se n�o for poss�vel acessar o dispositivo de �udio, mostre uma mensagem de erro adequada
            console.error('N�o foi poss�vel acessar o dispositivo de �udio', err);
        }
    }
};