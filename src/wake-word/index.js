import { PorcupineWorker } from "@picovoice/porcupine-web";
import { WebVoiceProcessor } from '@picovoice/web-voice-processor';

export async function registerWakeWord(wordFoundFn) {
  const key = localStorage.getItem('PV_KEY');
  const keyword = 'Bumblebee';
  // const keyword = {
  //   publicPath: `${import.meta.env.BASE_URL}assets/wake-word/keywords/Hot-Pink_en_wasm_v4_0_0.ppn`,
  //   label: 'Hot Pink'
  // };
  const porcupine = await PorcupineWorker.create(key, [keyword], wordFoundFn, {
    publicPath: `${import.meta.env.BASE_URL}assets/wake-word/porcupine_params.pv`,
    customWritePath: "4.0.0_porcupine_params.pv"
  });

  await WebVoiceProcessor.subscribe(porcupine);
}
