// Takes the `cors` package factory as a parameter rather than importing it
// directly: this file lives under shared/, a sibling of each app's own
// node_modules (not an ancestor), so a bare `import cors from "cors"` here
// can't resolve it from either app's own installed dependency.
export function createCorsMiddleware(cors) {
  return cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (
        origin === `https://${process.env.DATABRICKS_HOST}` ||
        /\.databricksapps\.com$/.test(origin) ||
        /^http:\/\/localhost(:\d+)?$/.test(origin)
      )
        return cb(null, true);
      cb(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  });
}
