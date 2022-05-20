const socket = io('/')
const videoGrid = document.querySelector('#video-grid')
const myVideo = document.createElement('video')
const showChat = document.querySelector('#showChat')
const backBtn = document.querySelector('.header__back')
const inviteButton = document.querySelector('#inviteButton')
const stopVideo = document.querySelector('#stopVideo')
const muteButton = document.querySelector('#muteButton')
const messageForm = document.querySelector('form')
const message = document.querySelector('#chat_message')
const sendMessage = document.querySelector('#send')
const messages = document.querySelector('.messages')
myVideo.muted = true

const user = prompt('Enter your name')

const peer = new Peer(undefined, {
    host: '/',
    port: 3030,
    path: '/peerjs'
})

let myVideoStream;
navigator.mediaDevices
  .getUserMedia({
    audio: true,
    video: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });
  });

peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id, user);
});

muteButton.addEventListener('click', () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled

    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false
        html = `<i class="fas fa-microphone-slash"></i>`
        muteButton.classList.toggle('background__red')
        muteButton.innerHTML = html
    } else {
        myVideoStream.getAudioTracks()[0].enabled = true
        html = `<i class="fas fa-microphone"></i>`
        muteButton.classList.toggle('background__red')
        muteButton.innerHTML = html
    }
})

stopVideo.addEventListener('click', () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled

    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false
        html = `<i class="fas fa-video-slash"></i>`
        stopVideo.classList.toggle('background__red')
        stopVideo.innerHTML = html
    } else {
        myVideoStream.getVideoTracks()[0].enabled = true
        html = `<i class="fas fa-video"></i>`
        stopVideo.classList.toggle('background__red')
        stopVideo.innerHTML = html
    }
})

inviteButton.addEventListener('click', e => {
    prompt(
        'Copy this link and send it to people you want to meet with',
        window.location.href
    )
})

sendMessage.addEventListener('click', (e) => {
    e.preventDefault()
    
    if (message.value.length !== 0) {
        socket.emit('message', message.value)
        message.value = ''
    } 
})

socket.on('createMessage', (message, userName) => {
    const item = document.createElement('li')
    item.classList.add('message')

    console.log('message send')

    item.innerHTML = `
    <b><i class="far fa-user-circle"></i> <span> ${
        userName === user ? "me" : userName
      }</span> </b>
      <span>${message}</span>
    `

    messages.appendChild(item)
})

const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
};

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
    videoGrid.append(video);
  });
};
