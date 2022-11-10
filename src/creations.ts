export interface Creation {
  name: string;
  imageUrl: string;
  description: string;
}

export const creations: Creation[] = [
  {
    name: 'Gamma',
    imageUrl: 'https://i.imgur.com/yltQhss.png',
    description: 'A performance-oriented 3D engine in C++, using SDL for the video/multimedia layer and an OpenGL graphics backend.'
  },
  {
    name: 'Sound Painter',
    imageUrl: 'https://i.imgur.com/rWhPOOJ.png',
    description: 'Visualizes music in real time using painterly brush strokes. Drag and drop a .mp3 or .wav file in to see the effect.'
  },
  {
    name: 'Pokemap',
    imageUrl: 'https://i.imgur.com/JKF635s.png',
    description: 'Drag around a large, procedurally-generated map in the style of Pokemon Gold & Silver.'
  }
];