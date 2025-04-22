export type WallpaperGeneratorActions = {
  set_replicate_key: { replicateKey: string }
  generate: { prompt: string }
  delete_generation: { id: string }
  delete_all_generations: {}
  delete_replicate_key: {}
}
