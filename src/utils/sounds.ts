import {
  type AudioPlayer,
  createAudioPlayer,
  setAudioModeAsync,
} from 'expo-audio';

// Kenney "Impact Sounds" and "Interface Sounds" (CC0, kenney.nl): impactWood_light_000, impactWood_medium_000,
// confirmation_002, error_005, converted to mono mp3.
const SOURCES = {
  move: require('../../assets/sounds/move.mp3'),
  capture: require('../../assets/sounds/capture.mp3'),
  correct: require('../../assets/sounds/correct.mp3'),
  wrong: require('../../assets/sounds/wrong.mp3'),
} as const;

export type Sound = keyof typeof SOURCES;

let players: Record<Sound, AudioPlayer> | undefined;

/** Creates the players once. Sounds follow the silent switch and never stop the user's music. */
export function preloadSounds() {
  if (players) return;
  players = Object.fromEntries(
    (Object.keys(SOURCES) as Sound[]).map((n) => [
      n,
      createAudioPlayer(SOURCES[n]),
    ]),
  ) as Record<Sound, AudioPlayer>;
  void setAudioModeAsync({
    playsInSilentMode: false,
    interruptionMode: 'mixWithOthers',
  }).catch(() => undefined);
}

export function playSound(name: Sound) {
  const player = players?.[name];
  if (!player?.isLoaded) return; // first frames after startup: the buffer is not ready yet
  if (player.currentTime > 0)
    void player
      .seekTo(0)
      .then(() => player.play())
      .catch(() => undefined);
  else player.play();
}
