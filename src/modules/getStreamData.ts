import { store } from "../lib/store";

export default async function (
  id: string,
  prefetch: boolean = false
): Promise<Piped | Record<'error' | 'message', string>> {
  
  const { piped } = store.api;
  const { hls, fallback } = store.player;

  const fetchDataFromPiped = (api: string) =>
    fetch(`${api}/streams/${id}`)
      .then(res => res.json())
      .then(data => {
        if (hls.on ? data.hls : data.audioStreams.length)
          return data;
        else throw new Error(data.message);
      });

  const emergency = (e: Error) =>
    (!prefetch && fallback) ? 
      fetchDataFromPiped(fallback).catch(() => e) 
      : e;

  const usePiped = (index = 0): Promise<Piped> =>
    fetchDataFromPiped(piped[index]).catch(() => {
      if (index + 1 === piped.length) return emergency(new Error("All Piped instances failed"));
      else return usePiped(index + 1);
    });

  const useHls = () => 
    Promise.allSettled((hls.api.length ? hls.api : piped).map(fetchDataFromPiped))
      .then(res => {
        const successful = res.filter(r => r.status === "fulfilled");
        hls.manifests.length = 0;

        successful.forEach(r => {
          if (r.value.hls) {
            hls.manifests.push(r.value.hls);
          }
        });

        return successful[0]?.value || { message: "No HLS sources are available." };
      });

  return hls.on ? useHls() : usePiped();
}
