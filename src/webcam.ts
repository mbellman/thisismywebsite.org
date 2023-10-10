export async function getCameraFeed(): Promise<HTMLVideoElement> {
  const video = document.createElement('video');

  const width = 750;
  const height = 400;

  video.width = width;
  video.height = height;
  video.style.position = 'absolute';
  video.style.top = '0';
  video.style.left = '0';
  // video.style.visibility = 'hidden';

  document.body.appendChild(video);

  return new Promise((resolve, reject) => {
    window.navigator.mediaDevices.getUserMedia({
      video: {
        width,
        height,
        frameRate: {
          exact: 30,
          min: 30
        }
      }
    }).then(stream => {
      video.srcObject = stream;
  
      video.onloadedmetadata = () => {
        video.play();

        resolve(video);
      };
    }).catch(() => {
      // @todo
      reject(null);
    });
  });
}