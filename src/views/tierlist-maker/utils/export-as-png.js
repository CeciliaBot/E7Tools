import { lazyOnload } from '@/directives/lazyloader.js';
export default function(_this) { /* _this === vue context instance */
    _this.$store.commit('loading', true);
    _this.$nextTick(()=> {
        import(/* webpackPrefetch: true, webpackChunkName: "html2canvas.patched" */ '../utils/html2canvas.patched.js').then( module => {
            let TARGET_WIDTH = 800,
                chPerRow = Math.ceil(TARGET_WIDTH/_this.iconFullSize),
                size = 100+chPerRow/2+_this.iconFullSize*chPerRow;

            var options = {
                allowTaint: false,
                useCORS: true,
                imageTimeout: 0,
                backgroundColor: '#252B35', 
                logging: false, 
                x: 0,
                y: 0,
                scrollX: 0,
                scrollY: 0,
                scale: 1.2,
                onclone: async (doc) => {
                    var promiseAll = [];
                    doc.querySelectorAll('img[data-src]').forEach(function (img) { /* Load all lazy loaded imgs */
                        const src = img.getAttribute('data-src');
                        img.setAttribute('src', src);
                        img.removeAttribute('data-src');
                        promiseAll.push(new Promise( (resolve, reject) => {
                            img.onload = (e) => {
                                lazyOnload(e);
                                resolve(img)
                            };
                            img.onerror = () => reject(img);
                        }))
                    })
                    await Promise.all(promiseAll).catch( () => {})
                    promiseAll = null;
                    if (!_this.tierType) {
                        if (_this.settings.exportTitlessImage) {
                            let title = doc.querySelector('.tier-list-title');
                            if (title) title.style.display = 'none';
                        }

                        let canvas = doc.querySelector('#tiers');
                        var elContainer = canvas.querySelectorAll('.tier-list');
                        elContainer.forEach(row => {row.style.paddingRight = '0';});
                        canvas.style.width = size+'px';
                    } else {
                        let canvas = doc.querySelector('#XYCanvas');
                        let imageMargin = _this.iconFullSize+15;
                        var container = canvas.parentNode;
                        container.style.transform = 'scale(1)';
                        container.style.padding = imageMargin/2+'px';
                        var info = container.getBoundingClientRect();
                        canvas.style.position = 'relative'
                        canvas.style.backgroundColor = '#252B35';
                        canvas.style.border = 'solid thin'
                        canvas.style.height = info.height+'px';
                        canvas.style.width = info.width+'px';
                        options.width = info.width+imageMargin;
                        options.height = info.height+imageMargin;
                    }
                },
                onrendered: () => {
                },
            };
            module.default(document.getElementById(!_this.tierType?'tiers':'AlignChart'), options).then(canvas => {
                try {
                    _this.$gallery(
                        [
                            {
                                src: canvas.toDataURL(),
                                name: _this.tierListName,
                                description: 'Click the download button or right click on the image to save your tier list!'
                            }
                        ]
                    )
                } catch(err) {
                    var link = document.createElement('a');
                    link.download = _this.tierListName+'.png';
                    link.href = canvas.toDataURL()
                    link.click();
                }
            }).finally( () => {
                _this.$store.commit('loading', false);
            })
        })
    })
}