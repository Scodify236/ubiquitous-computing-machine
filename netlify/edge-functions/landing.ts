import type { Config, Context } from "@netlify/edge-functions";


export default async function handler(_: Request, context: Context) {

  const cgeo = context.geo.country?.code || 'IN';
  const html = `
      <p style="
        background:url('/rh_thumbnail_min.webp') center;
        padding: 3vmin;
        box-shadow: var(--shadow);
        border-radius: var(--roundness);
        background-size:cover;
        color:white;
         " align="center">
          <b style="background-color:rgba(255, 255, 255, 0);
          display:block;
          backdrop-filter: blur(1px);
          ">
            Welcome to Raag heaven fork of ytify, to get in touch click, <a href="https://shcloud.netlify.app/cont.html"
              style="text-decoration: underline;" target="_blank">here</a>.
          </b>
        ${cgeo === 'IN' ?
      `` : ''
    }
      </p>
    `;

  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
}

export const config: Config = {
  path: "/landing",
};
