import { initializeDebugConsole } from './debug';
// import { createGestureAnalyzer, createHandDetector } from './gestures';
// import { getCameraFeed } from './webcam';
import { Router } from '@panes';
import setupHomePage from './routes/home/page';
import setupPanesPage from './routes/panes/page'
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
  const router = new Router({
    '/': setupHomePage,
    '/panes': setupPanesPage
  });
}

main();