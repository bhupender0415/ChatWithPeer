let APP_ID = "7a10b49045af4d43815162655efbb65f"

let token = null;
let uid = String(Math.floor(Math.random()*10000))

let client;
let channel;

let localStream;
let remoteStream;
let peerConnection;

const servers = {
    iceServers:[
        {
            urls:['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
        }
    ]
}


let init = async() => {

    client = await AgoraRTM.createInstance(APP_ID)
    await client.login({uid, token})
    
    //index.html?room=352432
    channel = client.createChannel('main')
    await channel.join()

    channel.on('MemberJoined', handleUserJoined)

   

    localStream = await navigator.mediaDevices.getUserMedia({video:true, audio:false}) // accessing the video from the device camera
    document.getElementById('user-1').srcObject = localStream
}


let handleUserJoined = async (MemberID) => {
    console.log('A new user noined the channel:', MemberID)
    createOffer(MemberID)
}

let createOffer = async () => {
    peerConnection =  new RTCPeerConnection(servers)

    remoteStream = new MediaStream()
    document.getElementById('user-2').srcObject = remoteStream

    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream)
    })

    peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack()
        })
    }

    peerConnection.onicecandidate = async (event) => {
        if(event.candidate){
            console.log('New ICE candidate:', event.candidate)
        }
    }


    // creating an offer
    let offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)

    // sending message to the member joined
    console.log('Offer:', offer)

}

init()
