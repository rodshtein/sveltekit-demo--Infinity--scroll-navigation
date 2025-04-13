import data from "./data.json";

export function load({ params, isDataRequest, request }) {
  // Get the position of the publication in the database
  let slugIndex = data.findIndex((el) => el.id == params.slug);

  // Collect additional data. We'll need this below.
  // This is a small hack since SvelteKit doesn't give us a reliable way
  // to distinguish between a "Back" navigation and a regular data request.
  let refererURL = request.headers.get("referer");
  let referer = refererURL && new URL(refererURL);
  let requestFromHome = referer && referer.pathname == "/";
  let backNav = referer && referer.pathname.endsWith(params.slug);

  // For back navigation or coming from other pages, return 10 publications.
  // For data requests, return only 1 additional publication.
  let pages =
    backNav || requestFromHome || !isDataRequest
      ? data.slice(slugIndex, slugIndex + 10)
      : [data[slugIndex + 9]];

  return { pages };
}
