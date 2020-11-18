const path = require("path");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");

// Get a lot of shared modules by getting the entire dependency tree.
const dependencies = new Set();

/**
 * Recursively add pkg and all transitive dependencies to the cache set.
 */
function transitiveDependencies(pkg, cache) {
  if (cache.has(pkg)) {
    return;
  }
  cache.add(pkg);
  // Some packages do interesing things with their exports, so requiring
  // pkg/package.json does not always work.
  try {
    let { dependencies = {} } = require(`${pkg}/package.json`);
    for (dep of Object.keys(dependencies)) {
      transitiveDependencies(dep, cache);
    }
  } catch (e) {
    // Do not worry about dependencies we cannot add
  }
}

for (pkg of Object.keys(require("./package.json").dependencies)) {
  transitiveDependencies(pkg, dependencies);
}

const config = {
  entry: "./index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].[contenthash].js",
  },
  devtool: false,
  module: {
    rules: [
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        issuer: /\.js$/,
        use: {
          loader: "raw-loader",
        },
      },
    ],
  },
  optimization: {
    splitChunks: {
      // Setting these values do not change that each shared module is a chunk
      maxAsyncRequests: 5,
      maxInitialRequests: 5,
      minSize: 100000,
      minRemainingSize: 100000,

      // Uncommenting this vender cache group finally bundles the shared
      // modules into a small number of js files

      // cacheGroups: {
      //   vendor: {
      //     test: /[\\/]node_modules[\\/]/,
      //     name: 'vendors',
      //     chunks: 'all'
      //   }
      // }
    },
  },
  resolve: {
    fallback: {
      browser: false,
      url: false,
    },
  },
  plugins: [
    new ModuleFederationPlugin({
      shared: Array.from(dependencies),
    }),
  ],
};

module.exports = config;
