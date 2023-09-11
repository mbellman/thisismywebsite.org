export async function getCameraFeed(): Promise<HTMLVideoElement> {
  const video = document.createElement('video');
  const canvas = document.createElement('canvas');

  {
    video.width = 320;
    video.height = 240;
    video.style.position = 'absolute';
    video.style.visibility = 'hidden';
  
    document.body.appendChild(video);
  }

  {
    canvas.width = 320;
    canvas.height = 240;
    canvas.style.position = 'absolute';
  
    canvas.setAttribute('id', 'canvas');
  
    document.body.appendChild(canvas);
  }

  await window.navigator.mediaDevices.getUserMedia({
    video: {
      width: 320,
      height: 240,
      frameRate: 30
    }
  }).then(stream => {
    video.srcObject = stream;

    video.onloadedmetadata = () => video.play();
  }).catch(() => {
    // ...
  });

  return video;
}