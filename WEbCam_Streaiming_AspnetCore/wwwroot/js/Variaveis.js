var localstream;
var fileReader
var dataChannel;
var paused = true;
const otherAudio = document.getElementById('localVideo');
const partnerAudio = document.getElementById('remoteVideo');
const fileTable = document.getElementById('fileTable');
var peerConnectionConfig = { "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] };