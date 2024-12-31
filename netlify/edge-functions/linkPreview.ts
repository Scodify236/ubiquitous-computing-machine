import { Context, Config } from '@netlify/edge-functions';

export default async (request: Request, context: Context) => {

  const url = new URL(request.url);
  const id = url.searchParams.get('s') || '';

  if (id.length < 11) return;

  const response = await context.next();
  const page = await response.text();
  const data = await fetch(url.origin + '/streams/' + id).then(res => res.json())
  
  if (!data) return;
  const music = data.uploader.endsWith(' - Topic') ? 'https://wsrv.nl?w=180&h=180&fit=cover&url=' : '';
  const thumbnail = `${music}https://i.ytimg.com/vi_webp/${id}/mqdefault.webp`;
  const newPage = page
    .replace('48-320kbps Opus YouTube Audio Streaming Web App.', data.uploader.replace(' - Topic', ''))
    .replace('"Raag"', `"${data.title}"`)
    .replace('raag.us.kg', `raag.us.kg?s=${id}`)
    .replaceAll('/rh_thumbnail_min.webp', thumbnail);

  return new Response(newPage, response);
};

export const config: Config = {
  path: '/*'
};
