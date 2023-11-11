import { initializeDebugConsole } from './debug';
// import { createGestureAnalyzer, createHandDetector } from './gestures';
// import { getCameraFeed } from './webcam';
import { setupHomePage } from './page-home';
import { setupPanesPage } from './page-panes'
import './global-styles.scss';

// async function initializeGestureAnalyzer() {
//   const video = await getCameraFeed();
//   const detector = await createHandDetector();

//   const analyzer = createGestureAnalyzer(detector, {
//     debug: true
//   });

//   let paused = false;

//   window.addEventListener('blur', () => {
//     paused = true;
//   });

//   window.addEventListener('focus', () => {
//     paused = false;
//   });

//   setInterval(() => {
//     if (!paused) {
//       analyzer.analyze(video);
//     }
//   }, 0);

//   return analyzer;
// }

async function main() {
  // const analyzer = await initializeGestureAnalyzer();

  // setupHomePage();
  setupPanesPage();
}

main();