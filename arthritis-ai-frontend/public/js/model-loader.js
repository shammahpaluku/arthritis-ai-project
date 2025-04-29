// For browser-side prediction
export async function loadArthritisModel() {
  const model = await tf.loadLayersModel('/models/arthritis_model.json');
  const metadata = await fetch('/models/model_metadata.json').then(res => res.json());
  return { model, metadata };
}
