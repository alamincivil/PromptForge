
export enum Tone {
  Funny = 'Funny',
  Emotional = 'Emotional',
  Adventure = 'Adventure'
}

export enum Complexity {
  Simple = 'Simple',
  Intermediate = 'Intermediate',
  Advanced = 'Advanced'
}

export enum FocusPreset {
  VillageLife = 'Village Life',
  Monsoon = 'Monsoon',
  Festivals = 'Festivals',
  Animals = 'Animals',
  CityLife = 'City Life'
}

export interface Scene {
  number: number;
  styleLock: string;
  characters: string;
  setup: string;
  movement: string;
  background: string;
  lighting: string;
  mood: string;
  finalCheck: string;
}

export interface GeneratedProject {
  id: string;
  title: string;
  timestamp: number;
  tone: Tone;
  complexity: Complexity;
  focus: FocusPreset;
  sceneCount: number;
  scenes: Scene[];
}

export type ApiStatus = 'connected' | 'failed' | 'idle';
