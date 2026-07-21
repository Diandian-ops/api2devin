'use strict';

function stripProtoServer(arg0) {
  return String(arg0 || "").replace(/^https?:\/\//i, "").replace(/\/+$/, "");
}

function shouldUseHttpGateway(arg0) {
  const tmp1 = stripProtoServer(arg0).toLowerCase();
  if (!tmp1) {
    return false;
  }
  const tmp2 = tmp1.replace(/:\d+$/, "");
  if (tmp2 === "127.0.0.1" || tmp2 === "localhost" || tmp2 === "0.0.0.0" || tmp2 === "::1" || tmp2 === "[::1]") {
    return true;
  }
  const tmp3 = tmp1.match(/:(\d+)$/);
  if (tmp3) {
    const tmp4 = Number(tmp3[1]);
    return tmp4 !== 443 && tmp4 !== 80;
  }
  return false;
}

function ensureGatewayUrl(arg0) {
  const tmp1 = String(arg0 || "").trim();
  if (!tmp1) {
    throw new Error("请先填写 Base URL");
  }
  if (/^https?:\/\//i.test(tmp1)) {
    return tmp1;
  }
  const tmp2 = shouldUseHttpGateway(tmp1) ? "http://" : "https://";
  return tmp2 + stripProtoServer(tmp1);
}

function normalizePathname(arg0) {
  const tmp1 = String(arg0 || "").trim().replace(/\/+$/, "");
  return tmp1 && tmp1 !== "/" ? (tmp1.startsWith("/") ? tmp1 : "/" + tmp1) : "";
}

function stripKnownGatewayEndpoint(arg0) {
  const tmp1 = normalizePathname(arg0);
  if (!tmp1) {
    return "";
  }
  return normalizePathname(tmp1
    .replace(/\/chat\/completions$/i, "")
    .replace(/\/(?:messages|responses|models|completions)$/i, ""));
}

function inferGatewayApiPrefix(arg0) {
  const tmp1 = new URL(ensureGatewayUrl(arg0));
  const tmp2 = normalizePathname(tmp1.pathname);
  if (!tmp2) {
    return "/v1";
  }
  const tmp3 = stripKnownGatewayEndpoint(tmp2);
  if (tmp3) {
    return tmp3;
  }
  return /\/(?:messages|responses|models|completions)$/i.test(tmp2) ? "" : tmp2;
}

function buildGatewayModelUrls(arg0) {
  const tmp1 = new URL(ensureGatewayUrl(arg0));
  tmp1.search = "";
  tmp1.hash = "";
  const tmp2 = normalizePathname(tmp1.pathname);
  const tmp3 = inferGatewayApiPrefix(arg0);
  const tmp4 = [];
  const fn = arg02 => {
    const tmp02 = new URL(tmp1.toString());
    tmp02.pathname = normalizePathname(arg02) || "/models";
    const tmp12 = tmp02.toString();
    if (!tmp4.includes(tmp12)) {
      tmp4.push(tmp12);
    }
  };
  if (/\/models$/i.test(tmp2)) {
    fn(tmp2);
  }
  fn(tmp3 + "/models");
  if (tmp3 !== "/v1") {
    fn("/v1/models");
  }
  if (tmp3 !== "") {
    fn("/models");
  }
  return tmp4;
}

function deriveGatewayApiPaths(arg0, arg1 = "") {
  const tmp1 = arg1 ? inferGatewayApiPrefix(arg1) : inferGatewayApiPrefix(arg0);
  const tmp2 = tmp1;
  return {
    apiPrefix: tmp2,
    modelsPath: tmp2 + "/models",
    anthropicPath: tmp2 + "/messages",
    openaiResponsesPath: tmp2 + "/responses",
    openaiChatPath: tmp2 + "/chat/completions"
  };
}

module.exports = {
  stripProtoServer,
  shouldUseHttpGateway,
  ensureGatewayUrl,
  stripKnownGatewayEndpoint,
  inferGatewayApiPrefix,
  buildGatewayModelUrls,
  deriveGatewayApiPaths
};
