export interface Project {
  name: string;
  imageUrl: string;
  description: string;
  githubUrl?: string;
  demoUrl?: string;
}

export const projects: Project[] = [
  {
    name: 'Gamma (2021, 2022)',
    imageUrl: 'https://i.imgur.com/yltQhss.png',
    description: 'A performance-oriented 3D engine in C++, using SDL for the video/multimedia layer and an OpenGL graphics backend.',
    githubUrl: 'https://github.com/mbellman/gamma'
  },
  {
    name: 'Sound Painter (2021)',
    imageUrl: 'https://i.imgur.com/cYonbPK.png',
    description: 'Visualizes music in real time using painterly brush strokes. Drag and drop a .mp3 or .wav file in to see the effect.',
    githubUrl: 'https://github.com/mbellman/sound-painter',
    demoUrl: 'https://thisismywebsite.org/sound-painter'
  },
  {
    name: 'Pokemap (2021)',
    imageUrl: 'https://i.imgur.com/nXKIMm8.png',
    description: 'Drag around a large, procedurally-generated map in the style of Pokemon Gold & Silver.',
    githubUrl: 'https://github.com/mbellman/worldmap',
    demoUrl: 'https://thisismywebsite.org/pokemap/'
  },
  {
    name: 'Polygarden (2020)',
    imageUrl: 'https://i.imgur.com/rwhLvrw.jpeg',
    description: 'A gardening game demo.'
  },
  {
    name: 'Quant (2020)',
    imageUrl: 'https://i.imgur.com/q8JlvMZ.png',
    description: 'A stock charting tool with a handful of technicals and some primitive, but largely unreliable, reversal/trend detection techniques.'
  },
  {
    name: 'Adamantine (2019, 2020)',
    imageUrl: 'https://i.imgur.com/23HsqZG.png',
    description: 'A first effort at writing a hardware-accelerated 3D engine from scratch.'
  },
  {
    name: 'Dungeon Crawler (2019)',
    imageUrl: 'https://i.imgur.com/bj1Jgvx.png',
    description: 'An unfinished tile-based dungeon crawler with an Ancient Egyptian aesthetic.'
  },
  {
    name: 'SoftEngine (2019)',
    imageUrl: 'https://i.imgur.com/4zBzFVl.png',
    description: 'A 3D software rasterizer written in C++, using an SDL video/multimedia layer.'
  },
  {
    name: 'Polybabel (2018)',
    imageUrl: 'https://i.imgur.com/STxm5vO.png',
    description: 'A prototype Java-to-JavaScript transpiler, with architectural support for other languages.'
  },
  {
    name: 'Cosmodrone (2016)',
    imageUrl: 'https://i.imgur.com/V2z4O2P.png',
    description: 'A prototype space drone/station maintenance game written in a custom 2D engine.'
  }
];