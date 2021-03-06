const PRODUCTION = false;

const SERVER_NAME = `204.209.76.194`;
const SERVER_PORT = `:8000`;
const SERVER_PROTOCOL = "http://";
const WS_PROTOCOL = `ws://`;
const WS_BASE_URL = `${WS_PROTOCOL}${SERVER_NAME}${SERVER_PORT}/ws`;
const BASE_URL = `${SERVER_PROTOCOL}${SERVER_NAME}${SERVER_PORT}`;

export {BASE_URL, WS_BASE_URL};
