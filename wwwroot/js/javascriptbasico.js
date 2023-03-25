const acceptCall = () => {
    var callingUserName = $('#callmodal').attr('data-cid');
   wsconn.invoke('AnswerCall', true, caller).catch(err => console.error(err));
    $('#divChat').show()
    initiateOffer(caller.connectionId, localstream)
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
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        // Informe ao usuário que a funcionalidade não é suportada em seu navegador
        alert("funcionalidade não é suportada em seu navegador")
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        });
        otherAudio.srcObject = stream;
        localstream = stream;

    } catch (err) {
        // Se o usuário negar o acesso ao dispositivo de áudio/vídeo, mostre uma mensagem de erro adequada
        console.error('Não foi possível acessar o dispositivo de áudio/vídeo', err);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false,
            });
            otherAudio.srcObject = stream;
            localstream = stream;
        } catch (err) {
            // Se não for possível acessar o dispositivo de áudio, mostre uma mensagem de erro adequada
            console.error('Não foi possível acessar o dispositivo de áudio', err);
        }
    }
};