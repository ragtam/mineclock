import { PorcupineWorker } from "@picovoice/porcupine-web";
import { WebVoiceProcessor } from '@picovoice/web-voice-processor';

export async function registerWakeWord(wordFoundFn) {
  const key = localStorage.getItem('PV_KEY');
  const porcupine = await PorcupineWorker.create(key, ["Bumblebee"], wordFoundFn, {
    publicPath: `${import.meta.env.BASE_URL}assets/wake-word/porcupine_params.pv`,
    customWritePath: "4.0.0_porcupine_params.pv"
  });

  await WebVoiceProcessor.subscribe(porcupine);
}
