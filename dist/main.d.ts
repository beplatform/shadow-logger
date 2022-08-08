declare const serveDebugger: (debuggerUrlPath?: string, debuggerBuildPath?: string) => import("express-serve-static-core").Router;
declare const serveFSLogger: (logsApiUrl?: string, logsPath?: string) => import("express-serve-static-core").Router;
declare const serveS3Logger: (logsApiUrl: string, bucket?: string, path?: string) => import("express-serve-static-core").Router;
export { serveDebugger, serveFSLogger, serveS3Logger };
