import { App } from "APP";
import { manifest } from "MANIFEST";
import { toSvelteKitRequest } from "./firebase-to-svelte-kit.js";

/** @type {import('@sveltejs/kit').App} */
const app = new App(manifest);

/**
 * Firebase Cloud Function handler for SvelteKit
 *
 * This function converts the Firebase Cloud Function (Express.js) Request object
 * into a format consumable to the SvelteKit render() function
 *
 * Relevant documentation - https://firebase.google.com/docs/functions/http-events#read_values_from_the_request
 *
 * @param {import('firebase-functions').https.Request} request
 * @param {import('express').Response} response
 * @returns {Promise<void>}
 */
export default async function svelteKit(request, response) {
  const rendered = await app.render(toSvelteKitRequest(request));
  const body = await rendered.text();

  return rendered
    ? response.writeHead(rendered.status, rendered.headers).end(body)
    : response.writeHead(404, "Not Found").end();
}

/**
 * Splits headers into two categories: single value and multi value
 * @param {Headers} headers
 * @returns {{
 *   headers: Record<string, string>,
 *   multiValueHeaders: Record<string, string[]>
 * }}
 */
function split_headers(headers) {
  /** @type {Record<string, string>} */
  const h = {};

  /** @type {Record<string, string[]>} */
  const m = {};

  headers.forEach((value, key) => {
    if (key === "set-cookie") {
      m[key] = value.split(", ");
    } else {
      h[key] = value;
    }
  });

  return {
    headers: h,
    multiValueHeaders: m,
  };
}
