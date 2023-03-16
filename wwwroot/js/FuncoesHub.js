const userJoin = (username) => {
    console.info('Joining...');
    hubConnection.invoke("Join", username).catch((err) => {
        console.error(err);
    });

    $("#IdUser").text(username);
    dataStream('');
};
const dataStream = (acceptingUser) => {
    if (hubConnection.state === 'Connected') {
        hubConnection.send("UploadStream", subject, `${(acceptingUser) ? acceptingUser.connectionId : ''}`);
    }
};

const sendSignal = (candidate, partnerClientId) => {
    hubConnection.invoke('sendData', candidate, partnerClientId).catch(err => console.error(err));
};

const callUser = (connectionId) => {
    hubConnection.invoke('call', { "connectionId": connectionId });
};

const endCall = (connectionId) => {
    hubConnection.invoke('hangUp');
};

const acceptCall = () => {
    var callingUserName = $('#callmodal').attr('data-cid');
    hubConnection.invoke('AnswerCall', true, caller).catch(err => console.error(err));
    $('#callmodal').modal('hide');

};

const declineCall = () => {
    var callingUserName = $('#callmodal').attr('data-cid');
    hubConnection.invoke('AnswerCall', false, caller).catch(err => console.error(err));
    $('#callmodal').modal('hide');
};

