import { createGestureAnalyzer, createHandDetector } from './gestures';
import { setupPage } from './page-home';
import { getCameraFeed } from './webcam';

async function initializeGestureAnalyzer() {
  const video = await getCameraFeed();
  const detector = await createHandDetector();

  const analyzer = createGestureAnalyzer(detector, {
    debug: true
  });

  setInterval(() => {
    analyzer.analyze(video);
  }, 50);

  return analyzer;
}

async function main() {
  const analyzer = await initializeGestureAnalyzer();

  setupPage(analyzer);
}

main();