module.exports = {
  publicPath: './',
  filenameHashing: true,
  productionSourceMap: false,

  // css: {
  //   extract: false
  // },

  pages: {
    e7tools: {
      baseURL: '../',
      entry: 'src/main.js',
      template: 'public/index.html',
      filename: 'e7tools/index.html',
      title: 'CeciliaBot Tools',
      description: 'Tierlist Maker | Timeline | Powder Shop history | Gear Score Calculator.',
      //chunks: ['chunk-common', 'chunk-full-vendors', 'e7tools']
    },
    index: {
      baseURL: './',
      entry: 'src/views/camping-simulator/standalone/',
      template: 'public/index.html',
      filename: 'index.html',
      title: 'E7 Camp Simulator | CeciliaBot',
      description: 'Epic Seven Camping Simulator for Raid and Labyrinth. Add your roster to find the best team combination with high morale!',
      //chunks: ['chunk-common', 'chunk-light-vendors', 'index']
    },
    timelineStandalone: {
      baseURL: '../',
      entry: 'src/views/timeline/standalone/',
      template: 'public/index.html',
      filename: 'timeline/index.html',
      title: 'CeciliaBot Timeline',
      description: 'Timeline of Epic Seven\'s Rate ups, Mystic Rotations, Coin shop rotations and Powder shop.',
      //chunks: ['chunk-common', 'chunk-light-vendors', 'timelineStandalone']
    }
  },

  // transpileDependencies: true,
  // [
  //   /.*vue-i18n.*/,
  //   /.*floating-ui\/dom.*/
  // ],
 
   chainWebpack: (config) => {
    // Disable prefetch for the /e7tools/ route
    config.plugins.delete('prefetch-e7tools');
    //config.plugins.delete('prefetch-timelineStandalone');
    //config.plugins.delete('prefetch-index');
    /* Prevent small images from being inlined to the code when using require() */
    config.module
      .rule('images')
        .set('parser', {
          dataUrlCondition: {
            maxSize: -1
          }
        });


    config.plugin('define').tap((definitions) => {
      Object.assign(definitions[0], {
        __VUE_I18N_FULL_INSTALL__: JSON.stringify(true),
        __INTLIFY_PROD_DEVTOOLS__: JSON.stringify(false),
        __VUE_I18N_LEGACY_API__: JSON.stringify(true),
      })

      return definitions
    })
   },


  lintOnSave: process.env.NODE_ENV !== 'production'
}