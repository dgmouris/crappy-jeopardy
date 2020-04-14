const PRODUCTION = false;

const SERVER_NAME = `www.nait.dev`;
const SERVER_PORT = ``
const WS_PROTOCOL = `wss://`
const WS_BASE_URL = `${WS_PROTOCOL}${SERVER_NAME}${SERVER_PORT}/ws`;
const BASE_URL = `https://${SERVER_NAME}${SERVER_PORT}`;

export {BASE_URL, WS_BASE_URL};
