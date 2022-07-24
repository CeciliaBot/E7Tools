export default function(_this) { /* _this === vue context instance */
    _this.$store.commit('loading', true);
    _this.$nextTick(()=> {
        import(/* webpackPrefetch: true */ '../utils/html2canvas.patched.js').then( module => {
            let TARGET_WIDTH = 800,
                chPerRow = Math.ceil(TARGET_WIDTH/_this.iconFullSize),
                size = 100+chPerRow/2+_this.iconFullSize*chPerRow;

            var options = {
                allowTaint: false,
                useCORS: true,
                backgroundColor: '#252B35', 
                logging: false, 
                x: 0,
                y: 0,
                scrollX: 0,
                scrollY: 0,
                scale: 1.2,
                onclone: (doc) => {
                    if (!_this.tierType) {
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
                var link = document.createElement('a');
                link.download = _this.tierListName+'.png';
                link.href = canvas.toDataURL()
                link.click();
            }).finally( () => {
                _this.$store.commit('loading', false);
            })
        })
    })
}