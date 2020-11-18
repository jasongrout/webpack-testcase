# Shared module bundles

We have a use case with webpack module federation where we are sharing around 100 modules. This is leading us to having around 100 js files loaded on our initial page load.

I thought we would be able to control the number/size of bundles using the `optimization.splitchunks` configuration, in particular the `maxAsyncRequests` or `maxInitialRequests`, however those do not seem to be helping. 

Is there a better way to combine shared modules into bundles other than using cacheGroups like below?

```js
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
```
