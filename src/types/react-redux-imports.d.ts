// provide typings for deep import used by Metro bundler
// since we import from the CJS build path instead of the package entrypoint

declare module "react-redux/dist/react-redux.js" {
  // re-export the main module's types/exports
  export * from "react-redux";
}
