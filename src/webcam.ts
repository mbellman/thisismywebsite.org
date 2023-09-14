export async function getCameraFeed(): Promise<HTMLVideoElement> {
  const video = document.createElement('video');

  video.width = 320;
  video.height = 240;
  video.style.position = 'absolute';
  video.style.top = '0';
  video.style.left = '0';
  video.style.visibility = 'hidden';

  document.body.appendChild(video);

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