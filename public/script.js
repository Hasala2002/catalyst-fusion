var screen = window.matchMedia("(max-width: 600px)")
let phone = false
let chatSize='-20%'
const setScreenSize = () =>{
  if(screen.matches){
    phone = true
    chatSize='-80%'
  }
  else{
    phone=false
    chatSize='-80%'
  }
  }
screen.addListener(setScreenSize())
const socket = io('/')
let userName;
const videoGrid = document.getElementById('video-grid')
const myVideo = document.createElement('video')
myVideo.muted = true;

var peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '443'
})

let myVideoStream
navigator.mediaDevices.getUserMedia({
    video:true,
    audio:true
}).then(stream =>{
  myVideoStream = stream
  addVideoStream(myVideo, stream)
  peer.on('call', function(call) {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream=> {
     addVideoStream(video, userVideoStream)
    })
});
  socket.on('user-connected',(userId)=>{
    connectToNewUser(userId,stream)
    myFunction(userId)
    userName = userId
})
})


socket.on('createMessage',message=>{
  $('ul').append(`<li class="message"><b>${userName} says:</b><br/>${message}</li>`)
  scrollToBottom()
})

peer.on('open',id=>{
    socket.emit('join-room',ROOM_ID, id)
})

const connectToNewUser = (userId,stream) => {
    const call = peer.call(userId,stream)
    const video = document.createElement('video')
    call.on('stream',userVideoStream =>{
        addVideoStream(video,userVideoStream)
    })
}


const addVideoStream = (video, stream) =>{
   video.srcObject = stream
   video.addEventListener('loadedmetadata', () => {
     video.play()
   })
   videoGrid.append(video)
}

let text = $('input')

$('html').keydown((e)=>{
  if(e.which === 13 && text.val().length !== 0){
    socket.emit('message',text.val())
    text.val('')
  }
})

const scrollToBottom = () =>{
  var d = $('messages');
  d.scrollTop(d.prop("scrollHeight"))
}

const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
}

const playStop = () => {
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo()
  } else {
    setStopVideo()
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone-alt"></i>
    <span>Mute</span>
  `
  document.querySelector('.main__mute__button').innerHTML = html;
}

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-alt-slash"></i>
    <span>Unmute</span>
  `
  document.querySelector('.main__mute__button').innerHTML = html;
}

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `
  document.querySelector('.main__video__button').innerHTML = html;
}

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Start Video</span>
  `
  document.querySelector('.main__video__button').innerHTML = html;
}
document.querySelector('.main__right').style.right = chatSize

const showHideChat = () =>{
  let enabled = document.querySelector('.main__right').style.right
  if(enabled!==chatSize){
    hideChat()
  }else{
    showChat()
  }
}

const hideChat = () => {
  const html = `
    <i class="fas fa-comment-slash"></i>
    <span>Open Chat</span>
  `
  document.querySelector('.main__chat__button').innerHTML=html
  document.querySelector('.main__right').style.right= chatSize;
  document.querySelector('.main__left').style.width = '100%';
}

const showChat = () => {
  const html = `
    <i class="fas fa-comment"></i>
    <span>Close Chat</span>
  `
  document.querySelector('.main__chat__button').innerHTML=html
  document.querySelector('.main__right').style.right = '0';
  if(!phone){
  document.querySelector('.main__left').style.width = '80%';
  }
}

function myFunction(userId) {
  var x = document.getElementById("snackbar");
  x.textContent=`${userId} just joined the meeting`
  x.className = "show";
  setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
}

document.getElementById('close').addEventListener('click',()=>{
  hideChat()
})