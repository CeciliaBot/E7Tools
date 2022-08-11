module.exports = {
  publicPath: './',
  filenameHashing: false,
  productionSourceMap: false,

  chainWebpack: (config) => {
    // Disable prefetch for the /e7tools/ route
    config.plugins.delete('prefetch-e7tools');
    //config.plugins.delete('prefetch-Timeline');
    //config.plugins.delete('prefetch-camp');
    /* Prevent small images from being inlined to the code when using require() */
    config.module
      .rule('images')
        .set('parser', {
          dataUrlCondition: {
            maxSize: -1
          }
        })
  },

  pages: {
    // index: {
    //   entry: 'src/views/camping-simulator/',
    //   template: 'public/index.html',
    //   filename: 'index.html',
    //   title: 'CeciliaBot Camping Simulator',
    //   description: 'Epic Seven Camping Simulator for Raid and Labyrinth. Add your roster to find the best team combination with high morale!',
    //   chunks: ['chunk-vendors', 'chunk-common', 'index'],
    //   baseURL: './'
    // },
    e7tools: {
      entry: 'src/main.js',
      template: 'public/index.html',
      filename: 'e7tools/index.html',
      title: 'CeciliaBot Tools',
      description: 'Tierlist Maker | Timeline | Powder Shop history | Gear Score.',
      baseURL: '../'
    },
    timelineStandalone: {
      entry: 'src/views/timeline/standalone/',
      template: 'public/index.html',
      filename: 'timeline/index.html',
      title: 'CeciliaBot Timeline',
      description: 'Timeline of Epic Seven\'s Rate ups, Mystic Rotations, Coin shop rotations and Powder shop.',
      baseURL: '../'
    },
    // Standalone version of the Tier List Maker
    // TierListMaker: {
    //   entry: 'src/views/tierlist-maker/standalone/',
    //   template: 'public/index.html',
    //   filename: 'tierlist-maker/index.html',
    //   title: 'CeciliaBot Tier List',
    //   description: 'Tier List Maker for Epic Seven.',
    //   baseURL: '../'
    // }
  },

  lintOnSave: process.env.NODE_ENV !== 'production',

  // devServer: {
  //   overlay: {
  //     warnings: true,
  //     errors: true
  //   }
  // }
}
