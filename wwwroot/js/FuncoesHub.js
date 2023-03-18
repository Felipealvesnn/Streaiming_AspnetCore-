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

const intervalHandle = setInterval(() => {
    var state = btnOpenCamera.getAttribute('data-state');
    if (state === 'opened') {
        subject.next(`${(acceptinguser) ? acceptinguser.connectionId : ''}|${getVideoFrame()}`);
        hubConnection.stream("DownloadStream", 500)
            .subscribe({
                next: (item) => {
                    console.info(item);
                },
                complete: () => {

                },
                error: (err) => {
                    console.error(err);
                },
            });
    } else {
        //subject.complete();
    }
}, 500);



btnOpenCamera.onclick = function () {
    var state = btnOpenCamera.getAttribute('data-state')
    if (state === 'opened') {
        var stream = video.srcObject;
        var tracks = stream.getTracks();

        for (var i = 0; i < tracks.length; i++) {
            var track = tracks[i];
            track.stop();
        }
        video.srcObject = null;
        btnOpenCamera.setAttribute('data-state', 'closed');
        document.getElementById('imgHub').src = '';
        btnOpenCamera.classList.add('btn-info');
        btnOpenCamera.classList.remove('btn-danger');
        btnOpenCamera.innerHTML = "Open Camera";
    } else {

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: { width: 200, height: 200 }, frameRate: { ideal: 5, max: 10 }, audio: false }).then(function (stream) {
                video.srcObject = stream;
                video.play();
            });
        }
        btnOpenCamera.setAttribute('data-state', 'opened');
        btnOpenCamera.classList.add('btn-danger');
        btnOpenCamera.classList.remove('btn-info');
        btnOpenCamera.innerHTML = "Close Camera";
    }
};

btnClose.onclick = function () {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        alert("WebSocket not connected.");
    }
    socket.close(1000, "Closing...");
};

btnConnect.onclick = function () {
    lblState.innerHTML = "Connecting...";
    socket = new WebSocket(server.value);
    socket.onopen = function (event) {
        updateState();
        lblState.innerHTML = `Connected to ${server.value}`;
        setInterval(() => {
            if (isOpen(socket)) {
                var data = getVideoFrame();
                socket.send(data);
            }
        }, 1000 / 6);
    };
    socket.onclose = function (event) {
        updateState();
    };
    socket.onerror = updateState;
    socket.onmessage = message => {
        document.getElementById('img').src = '';
        var image = new Image();
        image.src = `data:image/jpeg;base64,${message.data}`;
        document.getElementById('img').src = image.src;


    }
};

const updateState = () => {
    function disable() {
        btnClose.disabled = true;
    }
    function enable() {
        btnClose.disabled = false;
    }

    server.disabled = true;
    btnConnect.disabled = true;

    if (!socket) {
        disable();
    } else {
        switch (socket.readyState) {
            case WebSocket.CLOSED:
                lblState.innerHTML = "Closed";
                disable();
                server.disabled = false;
                btnConnect.disabled = false;
                img.src = '';
                break;
            case WebSocket.CLOSING:
                lblState.innerHTML = "Closing...";
                disable();
                break;
            case WebSocket.CONNECTING:
                lblState.innerHTML = "Connecting...";
                disable();
                break;
            case WebSocket.OPEN:
                lblState.innerHTML = "Open";
                enable();
                break;
            default:
                lblState.innerHTML = "Unknown state: " + htmlEscape(socket.readyState);
                disable();
                break;
        }
    }
}

const getVideoFrame = () => {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const data = canvas.toDataURL('image/jpeg', 0.2);
    return data;
}

const isOpen = (ws) => {
    return ws.readyState === ws.OPEN;
}

const htmlEscape = (str) => {
    return str.toString()
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}