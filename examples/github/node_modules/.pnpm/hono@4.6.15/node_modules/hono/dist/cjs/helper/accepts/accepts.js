"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var accepts_exports = {};
__export(accepts_exports, {
  accepts: () => accepts,
  defaultMatch: () => defaultMatch,
  parseAccept: () => parseAccept
});
module.exports = __toCommonJS(accepts_exports);
const parseAccept = (acceptHeader) => {
  const accepts2 = acceptHeader.split(",");
  return accepts2.map((accept) => {
    const parts = accept.trim().split(";");
    const type = parts[0];
    const params = parts.slice(1);
    const q = params.find((param) => param.startsWith("q="));
    const paramsObject = params.reduce((acc, param) => {
      const keyValue = param.split("=");
      const key = keyValue[0].trim();
      const value = keyValue[1].trim();
      acc[key] = value;
      return acc;
    }, {});
    return {
      type,
      params: paramsObject,
      q: q ? parseFloat(q.split("=")[1]) : 1
    };
  });
};
const defaultMatch = (accepts2, config) => {
  const { supports, default: defaultSupport } = config;
  const accept = accepts2.sort((a, b) => b.q - a.q).find((accept2) => supports.includes(accept2.type));
  return accept ? accept.type : defaultSupport;
};
const accepts = (c, options) => {
  const acceptHeader = c.req.header(options.header);
  if (!acceptHeader) {
    return options.default;
  }
  const accepts2 = parseAccept(acceptHeader);
  const match = options.match || defaultMatch;
  return match(accepts2, options);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  accepts,
  defaultMatch,
  parseAccept
});
