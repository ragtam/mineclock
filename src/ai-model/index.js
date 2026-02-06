import { pipeline } from '@huggingface/transformers';

export async function fun() {
    console.log('Running AI model...');
  // 1. Initialize the pipeline
  // 'device: webgpu' is crucial for speed.
  // 'dtype: q4' loads the highly compressed version (approx 300MB download).
  const generator = await pipeline('text-generation', 'onnx-community/Qwen2.5-0.5B-Instruct', {
    device: 'webgpu',
    dtype: 'q4', 
  });

  // 2. Define your input as a chat conversation
  // Since this is an "Instruct" model, it works best with messages, not just raw text.
  const messages = [
    { role: "system", content: "You are a helpful and concise assistant." },
    { role: "user", content: "Powiedz jakiś żart" },
  ];

  console.time('AI Generation');

  // 3. Generate
  const output = await generator(messages, {
    max_new_tokens: 100,
    do_sample: false, // "false" is faster and more deterministic
  });

    console.timeEnd('AI Generation');

  // 4. Parse output
  // The pipeline automatically handles the chat template and returns the response
  const response = output[0].generated_text.at(-1).content;
  console.log(response);
}