
<template>
    <div style="height: 100%; width: 100%; position: relative;">
        <div style="height: 100%; width: 100%; overflow: auto; position: relative;">
            <canvas ref="canvas" height="1500" width="1500" class="noselect dotted-bg" @mousedown="canvasMouseDown" @touchstart.prevent="canvasMouseDown" @touchup="canvasMouseUp" @mousemove="canvasMouseMove" @touchmove="canvasMouseMove" @mouseup="canvasMouseUp"/>
            <canvas ref="canvas_routes" height="1500" width="1500" class="noselect" style="position: absolute; pointer-events: none; top: 0; left: 0;" />
        </div>

        <div class="editor-menu right">
            <div class="option pointer" @click="editorMode='router'; mode = 'route'" v-tooltip="{value: 'Edit routes', placement: 'left'}" >
                <i class="fas fa-map-marker-alt" />
            </div>
            <div class="option pointer" @click="editorMode='maker'; mode = 'tile'" v-tooltip="{value: 'Edit map', placement: 'left'}" >
                <i class="fas fa-pencil-alt" />
            </div>
            <div class="option pointer" @click="download" v-tooltip="{value: 'Download as image', placement: 'left'}" >
                <i class="fas fa-download" />
            </div>
            <div class="option pointer" @click="$promiseAlert('new map', 'are you sure?', ['yes', 'no']).then(res => {if (res[0]===0) {map={ data: {}, start: null }  } })" v-tooltip="{value: 'New map', placement: 'left'}" >
                <i class="fas fa-file" />
            </div>
            <div class="option pointer" @click="closeMapEditor" v-tooltip="{value: 'Close map editor', placement: 'left'}" >
                <i class="fas fa-times" />
            </div>
        </div>
        <div  v-if="editorMode==='maker'" class="editor-menu top">
            <div v-for ="
                event in [
                    ['tile', 'icon_tile_ok_0001', 'Edit tiles'],
                    ['start', 'now', 'Starting point'],
                    ['waypoint', 'shortcut', 'Teleport/Waypoint'],
                    ['battle', 'icon_battle', 'Noraml battle'],
                    ['elite', 'icon_mob_elite', 'Elite Monster / Mini-boss'],
                    ['boss', 'icon_mob_boss', 'Boss battle'],
                    ['chest', 'icon_gold', 'Treasure chest'],
                    ['portal', 'icon_portal', 'Portal'],
                    ['switch', 'icon_switch_ready', 'Switch'],
                    ['npc', 'icon_npc_story', 'NPC'],
                    ['shop', 'icon_npc_shop', 'Shop']
                ]"
                :key="event[0]"
                :style="{background: event[0] === this.mode ? '#777777' : ''}"
                class="option pointer"
                v-tooltip="event[2]"
                @click="this.mode=event[0]"
            >
                <img :src="cdn+'ui/lab-builder/game_map_'+event[1]+'.png'" style="vertical-align: middle;" SameSite="Lax" />
            </div>
            <div class="option pointer" :style="{background: 'eraser' === this.mode ? '#777777' : ''}" @click="this.mode = 'eraser'" v-tooltip="'Delete cell'" >
                <i class="fas fa-eraser" />
            </div>
        </div>
    </div>
</template>

<script>
import { cdn } from '@/utils/constant.js'
async function promiseImageLoad(src) {
    return new Promise((res, rej) => {
        var el = new Image(src)
        el.src = src;
        el.setAttribute('SameSite', 'Lax')
        el.setAttribute('crossorigin', 'anonymous')
        el.onload = function() {
            res(el)
        }
        el.onerror = function() {
            rej()
        }
    })
} 
function getCoords(e, size, drawAngle) {
    const { x, y, left, top } = e.target.getBoundingClientRect();
    if (!drawAngle) {
        const mouseX = e.clientX - x;
        const mouseY = e.clientY - y;
        return [Math.floor(mouseX / size), Math.floor(mouseY / size)];
    } else {
        const angle = (drawAngle)*-1*Math.PI/180;
        const x2 = e.clientX-left;
        const y2 = e.clientY-top;
        var cos = Math.cos(angle);
        var sin = Math.sin(angle);

        var newx = x2 * cos - y2 * sin; 
        var newy = x2 * sin + y2 * cos;

        return [ Math.floor(newx/size), Math.floor(newy/size) ];
    }
}

export default {
    data() {
        return {
            style: 'game',
            tempRefs: [],
            imgsMap: {},
            cellSize: 32,
            dotEmptyCells: true,
            editorMode: 'maker',
            mode: 'tile',
            map: {"name":"Nixied 5","type":"lab","start":"40-29","data":{"2-21":{"type":"boss"},"40-29":{"type":"tp"},"40-28":{"type":"shop"},"40-27":{"type":"battle"},"40-26":{"type":null},"40-25":{"type":"battle"},"39-25":{"type":null},"38-25":{"type":null},"37-25":{"type":null},"36-25":{"type":"battle"},"36-24":{"type":null},"36-22":{"type":null},"36-23":{"type":"battle"},"36-21":{"type":"battle"},"34-21":{"type":null},"35-21":{"type":null},"33-21":{"type":"portal","ref":"36-27","text":"1"},"36-27":{"type":"portal","ref":"33-21","text":"1"},"35-27":{"type":null},"34-27":{"type":"battle","lock":["34-32",0,"34-32",0]},"34-26":{"type":null},"34-25":{"type":null},"34-24":{"type":"tp"},"34-23":{"type":"portal","ref":"29-22","text":"2"},"34-28":{"type":null},"34-29":{"type":"battle"},"34-30":{"type":null},"34-31":{"type":"battle"},"34-32":{"type":null,"text":"🔑a"},"34-33":{"type":null,"text":"💰1"},"33-32":{"type":"boss"},"32-32":{"type":null},"31-32":{"type":null},"30-32":{"type":null},"29-32":{"type":"tp"},"29-31":{"type":"battle"},"29-30":{"type":null},"29-29":{"type":"battle"},"29-28":{"type":null},"29-27":{"type":"battle"},"30-27":{"type":"battle"},"31-27":{"type":null},"32-27":{"type":"battle"},"33-27":{"type":null},"29-22":{"type":"portal","ref":"34-23","text":"2"},"29-21":{"type":"battle"},"29-20":{"type":null},"29-19":{"type":null},"30-19":{"type":null},"31-19":{"type":"battle"},"32-19":{"type":null},"33-19":{"type":null},"34-19":{"type":"tp"},"34-18":{"type":"battle"},"35-19":{"type":null},"36-19":{"type":null},"37-19":{"type":"boss"},"38-19":{"type":null,"text":"💰2"},"34-17":{"type":null},"34-16":{"type":"battle"},"35-16":{"type":null},"36-16":{"type":"portal","ref":"24-13","text":"3"},"33-16":{"type":null},"24-13":{"type":"portal","ref":"36-16","text":"3"},"25-13":{"type":null},"26-13":{"type":null},"27-13":{"type":"battle"},"27-12":{"type":null},"27-11":{"type":null},"27-10":{"type":null},"27-9":{"type":"portal","ref":"25-9","text":"4"},"25-9":{"type":"portal","ref":"27-9","text":"4"},"24-9":{"type":"battle"},"23-9":{"type":null},"22-9":{"type":"tp"},"22-10":{"type":null},"22-11":{"type":null},"22-12":{"type":"boss"},"22-13":{"type":null,"text":"🔑c"},"32-16":{"type":"portal","ref":"23-34","text":"5"},"22-8":{"type":"battle"},"22-7":{"type":null},"22-6":{"type":"battle"},"23-6":{"type":null},"24-6":{"type":"battle"},"25-6":{"type":"portal","ref":"34-7","text":"13"},"21-6":{"type":null},"20-6":{"type":null},"19-6":{"type":"boss"},"18-6":{"type":null,"text":"4💰"},"21-9":{"type":null},"20-9":{"type":"battle"},"19-9":{"type":null},"18-9":{"type":"portal","ref":"27-7","text":"14"},"27-7":{"type":"portal","ref":"18-9","text":"14"},"28-7":{"type":"battle"},"29-7":{"type":null},"30-7":{"type":"tp"},"31-7":{"type":null},"30-8":{"type":null},"30-9":{"type":"battle"},"30-10":{"type":null},"30-11":{"type":"portal","ref":"23-16","text":"15"},"32-7":{"type":"battle"},"33-7":{"type":null},"34-7":{"type":"portal","ref":"25-6","text":"13"},"23-16":{"type":"portal","ref":"30-11","text":"15"},"24-16":{"type":"battle"},"25-16":{"type":null},"26-16":{"type":null},"26-17":{"type":null},"26-18":{"type":"battle"},"26-19":{"type":null},"26-20":{"type":"battle"},"26-21":{"type":null,"lock":[0,0,0,"22-13"]},"25-21":{"type":null},"26-22":{"type":null},"26-23":{"type":"battle"},"26-24":{"type":null},"26-25":{"type":"battle"},"26-26":{"type":null},"26-27":{"type":"tp"},"25-27":{"type":null},"26-28":{"type":null},"26-29":{"type":null},"26-30":{"type":null},"25-30":{"type":null},"24-30":{"type":"battle"},"23-30":{"type":null},"22-30":{"type":"tp"},"22-29":{"type":"battle"},"22-28":{"type":null},"22-27":{"type":null},"23-27":{"type":null},"24-27":{"type":"battle"},"21-30":{"type":null},"20-30":{"type":null},"19-30":{"type":"boss"},"18-30":{"type":null,"text":"💰3"},"26-31":{"type":null},"26-32":{"type":"battle"},"26-33":{"type":null},"26-34":{"type":"battle"},"25-34":{"type":null},"24-34":{"type":"battle"},"23-34":{"type":"portal","ref":"32-16","text":"5"},"24-21":{"type":null},"23-21":{"type":"tp","lock":[0,0,0,"22-23"]},"22-21":{"type":null},"21-21":{"type":null},"20-21":{"type":"boss"},"19-21":{"type":null},"18-21":{"type":"tp"},"18-20":{"type":"battle"},"18-22":{"type":"battle"},"18-23":{"type":null},"18-24":{"type":"battle"},"18-25":{"type":null,"text":"🔑g1"},"17-25":{"type":"battle"},"16-25":{"type":null},"15-25":{"type":"battle"},"14-25":{"type":"tp"},"14-24":{"type":"battle"},"14-23":{"type":null},"14-22":{"type":"battle"},"14-21":{"type":"shop"},"15-21":{"type":null},"16-21":{"type":"battle"},"17-21":{"type":null},"14-20":{"type":null},"14-19":{"type":"battle"},"14-18":{"type":null},"14-17":{"type":"tp"},"15-17":{"type":"battle"},"16-17":{"type":null},"17-17":{"type":"battle"},"18-17":{"type":null,"text":"🔑g2"},"18-18":{"type":"battle"},"18-19":{"type":null},"13-17":{"type":"battle"},"12-17":{"type":null},"11-17":{"type":"battle"},"10-17":{"type":null,"text":"🔑g4"},"10-18":{"type":"battle"},"10-19":{"type":null},"10-20":{"type":"battle"},"10-21":{"type":"tp","lock":[0,0,0,"18-25"]},"11-21":{"type":null},"12-21":{"type":"battle"},"13-21":{"type":null},"10-22":{"type":"battle"},"10-23":{"type":null},"10-24":{"type":"battle"},"10-25":{"type":null,"text":"🔑g3"},"11-25":{"type":"battle"},"12-25":{"type":null},"13-25":{"type":"battle"},"9-21":{"type":null,"lock":[0,0,0,"18-17"]},"8-21":{"type":null,"lock":[0,0,0,"10-25"]},"7-21":{"type":null,"lock":[0,0,0,"10-17"]},"6-21":{"type":"tp","lock":[0,0,0,"5-37"]},"6-20":{"type":"battle"},"6-19":{"type":null},"6-18":{"type":null,"lock":["7-5",0,0,0]},"6-17":{"type":"portal","ref":"7-4","text":"12"},"5-18":{"type":"portal","ref":"4-12","text":"9"},"6-22":{"type":"battle"},"6-23":{"type":null},"6-24":{"type":null,"lock":[0,0,"5-37",0]},"6-25":{"type":"portal","ref":"5-38","text":"8"},"5-24":{"type":"portal","ref":"11-38","text":"6"},"5-21":{"type":null,"lock":[0,0,0,"7-5"]},"4-21":{"type":null},"3-21":{"type":null},"1-21":{"type":null},"0-21":{"type":null,"text":"💰7"},"8-27":{"type":"portal","ref":"8-37","text":"7"},"8-28":{"type":null,"text":"🔑h1"},"8-29":{"type":null},"8-30":{"type":"battle"},"8-31":{"type":null},"8-32":{"type":"tp","lock":[0,0,"8-28","8-28"]},"8-33":{"type":"battle"},"8-34":{"type":null},"8-35":{"type":"battle"},"8-36":{"type":null},"8-37":{"type":"portal","ref":"8-27","text":"7"},"9-32":{"type":"battle"},"10-32":{"type":null},"11-32":{"type":"battle"},"11-33":{"type":null},"11-34":{"type":"battle"},"11-35":{"type":null},"11-36":{"type":"battle"},"11-37":{"type":null},"11-38":{"type":"portal","ref":"5-24","text":"6"},"7-32":{"type":"battle"},"6-32":{"type":null},"5-32":{"type":"battle"},"5-33":{"type":null},"5-34":{"type":null},"5-35":{"type":"boss"},"5-36":{"type":null},"5-37":{"type":null,"text":"🔑h2"},"5-38":{"type":"portal","ref":"6-25","text":"8","lock":["5-37",0,0,0]},"8-15":{"type":"portal","ref":"12-11","text":"10"},"8-14":{"type":"battle"},"8-13":{"type":null},"8-12":{"type":"battle"},"7-12":{"type":null},"6-12":{"type":"battle"},"5-12":{"type":null},"4-12":{"type":"portal","ref":"5-18","text":"9"},"7-10":{"type":"tp"},"8-10":{"type":"battle"},"9-10":{"type":null},"10-10":{"type":null},"10-11":{"type":null},"10-12":{"type":"battle"},"10-13":{"type":null},"10-14":{"type":"tp"},"11-14":{"type":null},"7-9":{"type":null},"13-14":{"type":"portal","ref":"12-5","text":"11"},"12-14":{"type":"battle"},"7-8":{"type":null},"7-7":{"type":"boss"},"7-6":{"type":null},"7-5":{"type":null,"text":"🔑i"},"7-4":{"type":"portal","ref":"6-17","text":"12","lock":[0,0,"7-5",0]},"6-5":{"type":null,"text":"💰6"},"9-8":{"type":"battle"},"9-7":{"type":"battle"},"9-6":{"type":null},"9-5":{"type":"battle"},"10-5":{"type":null},"11-5":{"type":"battle"},"12-5":{"type":"portal","ref":"13-14","text":"11"},"10-8":{"type":null},"11-8":{"type":"battle"},"12-8":{"type":"battle"},"12-9":{"type":null},"12-10":{"type":"battle"},"12-11":{"type":"portal","ref":"8-15","text":"10"},"22-26":{"type":null},"22-25":{"type":null},"22-24":{"type":"boss"},"22-23":{"type":null,"text":"🔑f"},"4-37":{"type":null,"text":"💰5"}}},
            routes: []
        }
    },
    computed: {
        cdn() {
            return cdn
        }
    },
    watch: {
        // redraw whole map if any of this settings changes
        map() {
            this.draw()
        },
        style() {
            this.draw()
        },
        cellSize() {
            this.draw()
        }
    },
    created() {
        for (var key in this.map.data) {
            var data = this.map.data[key]
            if (data.type==="tp") {
                data.waypoint = true
            } else if (data.type === 'battle') {
                data.battle = true
            } else if (data.type === 'mini-boss') {
                data.elite = true
            } else if (data.type === 'boss') {
                data.boss = true
            } else if (data.type === 'shop') {
                data.shop = true
            } else if (data.type === 'portal' && data.ref) {
                data.portal = data.ref
            }
        }

        var imgs = [];
        ['clear', 'ok', 'yet'].forEach(status => {
            ['1111', '1010', '1001', '1000', '0110', '0101', '0100', '0010', '0001'].forEach(pos => {
                imgs.push(
                    promiseImageLoad(cdn + 'ui/lab-builder/game_map_icon_tile_'+status+'_'+pos+'.png').catch( () => {return ''}))
            })
        });
        [
            'battle',
            'boss',
            'box',
            'crystal',
            'goblin',
            'golden',
            'mob_boss',
            'mob_elite',
            'npc_story',
            'gold',
            'portal',
            'switch_ready',
            'switch_lock',
            'npc_shop',
            'dot'
        ].forEach(img => {
            imgs.push(
                promiseImageLoad(cdn + 'ui/lab-builder/game_map_icon_' + img + '.png').catch( () => {return ''})
            )
        });
        imgs.push( promiseImageLoad(cdn + 'ui/lab-builder/game_map_shortcut.png').catch( () => {return ''}) )
        imgs.push( promiseImageLoad(cdn + 'ui/lab-builder/game_map_now.png').catch( () => {return ''}) )
        Promise.all(
            imgs
        ).then( (res) => {
            res.forEach(img => {
                this.imgsMap[img.src] = img
            })
            this.$nextTick( () => {this.draw()})
        })
    },
    mounted() {

    },
    methods: {
        closeMapEditor() {
            this.$emit('close')
        },
        canvasMouseDown(e) {
            this.isMouseDown = true
            this.handleMouse(e)
        },
        canvasMouseMove(e) {
            if (this.isMouseDown) {
                this.handleMouse(e)
            }
        },
        canvasMouseUp() {
            this.isMouseDown = false
        },
        handleMouse(e) {
            switch (this.mode) {
                case 'tile':
                    return this.addTile(e)
                case 'waypoint':
                case 'battle':
                case 'boss':
                case 'elite':
                case 'shop':
                case 'chest':
                case 'switch':
                case 'npc':
                    return this.addMapEvent(e, this.mode)
                case 'start':
                    var clicked = getCoords(e, this.cellSize),
                        x = clicked[0],
                        y = clicked[1];
                    
                    var key = x + "-" + y;
                    var canvas = this.$refs.canvas;
                    var ctx = canvas.getContext('2d');
                    var data = this.map.data;
                    if (!data[key])
                        return;
                    
                    if (this.map.start === key)
                        return;

                    if (this.map.start) {
                        var cell = this.map.start,
                            x1 = Number(cell.split(/\b-/)[0]),
                            y1 = Number(cell.split(/\b-/)[1])
                        this.map.start = null;
                        this.deleteCell(ctx, data[cell], x1, y1)
                        this.drawCell(ctx, data[cell], x1, y1)
                    }

                    this.map.start = key
                    this.deleteCell(ctx, data[key], x, y)
                    this.drawCell(ctx, data[key], x, y)
                    break;
                case 'portal':
                    var clicked = getCoords(e, this.cellSize),
                        x = clicked[0],
                        y = clicked[1];
                    
                    var key = x + "-" + y;
                    var canvas = this.$refs.canvas;
                    var ctx = canvas.getContext('2d');
                    var r = this.tempRefs;
                    if (e.shiftKey) {
                        [key, this.map.data[key].portal].forEach(cell => {
                            if (!cell)
                                return;
                            var x1=x, y1=y;
                            if (cell!=key) {
                                x1 = Number(cell.split(/\b-/)[0])
                                y1 = Number(cell.split(/\b-/)[1])
                            }
                            delete this.map.data[key].portal
                            this.deleteCell(ctx, this.map.data[cell], x1, y1)
                            this.drawCell(ctx, this.map.data[cell], x1, y1)
                        })
                    } else {
                        if (!r.includes(key) && this.map.data[key]) {
                            r.push(key)
                            if (r.length===1)this.$snackbar.log({title: 'Select exit point'})
                        }
                        if (r.length===2) {
                            this.map.data[r[0]].portal = r[1];
                            this.map.data[r[1]].portal = r[0]
                            r.forEach(cell => {
                                var x1=x, y1=y;
                                if (cell!=key) {
                                    x1 = Number(cell.split(/\b-/)[0])
                                    y1 = Number(cell.split(/\b-/)[1])
                                }
                                this.deleteCell(ctx, this.map.data[cell], x1, y1)
                                this.drawCell(ctx, this.map.data[cell], x1, y1)
                            })
                            this.tempRefs = []
                        }
                    }
                    break;
                case 'eraser':
                    var clicked = getCoords(e, this.cellSize),
                        x = clicked[0],
                        y = clicked[1];
                    
                    var key = x + "-" + y;
                    var canvas = this.$refs.canvas;
                    var ctx = canvas.getContext('2d');
                    if (this.map.data[key])
                        delete this.map.data[key],
                        this.deleteCell(ctx, this.map.data[key], x, y, true);
                    break;
                case 'route':
                    break;
            }
        },

        getNeighbours(x,y) {
            return [(x-1) + '-' + y, (x+1) + '-' + y, x + '-' + (y-1), x + '-' + (y+1)].map( x => {
                return this.map.data[x] ? x : undefined;
            })
        },
        getCellConnections(cellId) {
            var x = Number(cellId.split(/\b-/)[0]),
                y = Number(cellId.split(/\b-/)[1]);
            var res = this.getNeighbours(x,y).map(cell => {
                return cell ? 1 : 0;
            })
            return res;
        },
        getImageId(arrConnected, isWaypoint, visited) {
            var length = arrConnected.filter(x => x!=0).length
            var type = isWaypoint ? 'clear' : 'ok';
            if ((arrConnected[0] && arrConnected[1]) || (arrConnected[2] && arrConnected[3]) || !length)
                return cdn + 'ui/lab-builder/game_map_icon_tile_' + type + '_1111.png';
            return cdn + 'ui/lab-builder/game_map_icon_tile_' + type + '_' + arrConnected.join('') + '.png';
        },
        addTile(mouseEvent) {
            var clicked = getCoords(mouseEvent, this.cellSize),
                x = clicked[0],
                y = clicked[1];
            
            var key = x + "-" + y;
            var canvas = this.$refs.canvas;
            var ctx = canvas.getContext('2d');
            if (mouseEvent.shiftKey) {
                if (!this.map.data[key]) return;
                delete this.map.data[key];
                this.deleteCell(ctx, this.map.data[key], x, y, true)
            } else {
                if (this.map.data[key]) return;
                this.map.data[key] = {
                    type: null
                }
                this.drawCell(ctx, this.map.data[key], x, y, true)
            }
        },
        addMapEvent(e, mapEvent) {
            var clicked = getCoords(e, this.cellSize),
                x = clicked[0],
                y = clicked[1];
            
            var key = x + "-" + y;
            var canvas = this.$refs.canvas;
            var ctx = canvas.getContext('2d')
            var data = this.map.data[key];
            if (!data) {
                return
            }
            if (e.shiftKey) {
                // delete event
                delete data[mapEvent]
            } else {
                // add event
                data[mapEvent] = true
            }
            this.deleteCell(ctx, data, x, y)
            this.drawCell(ctx, data, x, y)
        },
        drawCell(ctx, data, x, y, neighbours) {
            if (this.style==='game') {
                var connections = this.getCellConnections(x+'-'+y);
                var img = this.getImageId(connections, data.waypoint)
                ctx.drawImage(this.imgsMap[img], x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize)
            } else {
                ctx.beginPath()
                ctx.rect(x * this.cellSize+1, y * this.cellSize+1, this.cellSize-2, this.cellSize-2)
                ctx.fillStyle = data.waypoint ? 'orangered' : 'white'
                ctx.fill()
                ctx.lineWidth = 1
                ctx.strokeStyle = 'grey'
                ctx.stroke()
            }
            this.drawIcons(ctx, data, x, y)
            if (neighbours) { // update neighbours
                this.getNeighbours(x,y).forEach(cell => {
                    if (!cell)
                        return;
                    var positionX = Number(cell.split(/\b-/)[0]);
                    var positionY = Number(cell.split(/\b-/)[1]);
                    this.deleteCell(ctx, this.map.data[cell], positionX, positionY)
                    this.drawCell(ctx, this.map.data[cell], positionX, positionY)
                })
            }
        },
        drawIcons(ctx, data, x, y) {
            var toDraw = [];
            [
                ['boss', 'game_map_icon_mob_boss'],
                ['battle', 'game_map_icon_battle'],
                ['elite', 'game_map_icon_mob_elite'],
                ['npc', 'game_map_icon_npc_story'],
                ['shop', 'game_map_icon_npc_shop'],
                ['portal', 'game_map_icon_portal'],
                ['switch', 'game_map_icon_switch_ready'],
                ['chest', 'game_map_icon_gold']
            ].forEach(type => {
                if (data[type[0]])
                    toDraw.push(type[1])
            })
            if (this.map.start === x+'-'+y) {
                toDraw.push('game_map_now')
            } else if (this.dotEmptyCells && !toDraw.length) {
                toDraw.push('game_map_icon_dot')
            }
            toDraw.forEach(img => {
                ctx.drawImage(this.imgsMap[cdn + 'ui/lab-builder/'+img+'.png'], x * this.cellSize+this.cellSize*0.1, y * this.cellSize+this.cellSize*0.1, this.cellSize*0.8, this.cellSize*0.8)
            })

        },
        deleteCell(ctx, data, x, y, neighbours) {
            ctx.clearRect(x*this.cellSize, y*this.cellSize, this.cellSize, this.cellSize);
            if (neighbours) { // update neighbours
                this.getNeighbours(x,y).forEach(cell => {
                    if (!cell)
                        return;
                    var positionX = Number(cell.split(/\b-/)[0]);
                    var positionY = Number(cell.split(/\b-/)[1]);
                    this.deleteCell(ctx, this.map.data[cell], positionX, positionY)
                    this.drawCell(ctx, this.map.data[cell], positionX, positionY)
                })
            }
        },
        draw(canvas, afterClear) {
            canvas = canvas || this.$refs.canvas;
            var ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (afterClear) {
                afterClear(ctx)
            }
            ctx.lineWidth = 1;

            Object.keys(this.map.data).forEach((key) => {
                var positionX = Number(key.split(/\b-/)[0]);
                var positionY = Number(key.split(/\b-/)[1]);
                this.drawCell(ctx, this.map.data[key], positionX, positionY, false)
            })

            console.log('Done drawing cells ')
            this.drawMapInfo(this.$refs.canvas_routes, this.$refs.canvas_routes.getContext('2d'))
        },
        drawMapInfo(canvas, ctx) {
            ctx.font = this.cellSize*0.7 + "px Arial";
            var toPrint = [
                ['start', 'now', 'Starting point'],
                ['teleport', 'icon_tile_clear_1111', 'Teleport/Waypoint'],
                ['battle', 'icon_battle', 'Noraml battle'],
                ['elite', 'icon_mob_elite', 'Elite Monster / Mini-boss'],
                ['boss', 'icon_mob_boss', 'Boss battle'],
                ['chest', 'icon_gold', 'Treasure chest'],
                ['portal', 'icon_portal', 'Portal'],
                ['switch', 'icon_switch_ready', 'Switch'],
                ['npc', 'icon_npc_story', 'NPC'],
                ['shop','icon_npc_shop', 'Shop']
            ].filter((sum, i) => {
                return i === 0 || Object.values(this.map.data).some(cell => cell[sum[0]])
            })

            ctx.beginPath()
            var textBoxWidth = 6.25*this.cellSize
            ctx.rect(canvas.width-textBoxWidth-50, 25, textBoxWidth, toPrint.length*this.cellSize+this.cellSize/2)
            ctx.fillStyle = 'white'
            ctx.fill()

            toPrint.forEach( (sum, i) => {
                var y = 32+this.cellSize*i,
                    x = canvas.width-textBoxWidth-40;
                ctx.drawImage(this.imgsMap[cdn + 'ui/lab-builder/game_map_'+sum[1]+'.png'], x+this.cellSize*0.1, y+this.cellSize*0.1, this.cellSize*0.8, this.cellSize*0.8)
                ctx.fillStyle = 'black'
                ctx.fillText(sum[2], x+this.cellSize*1.1, y+this.cellSize/1.3)
            });
        },
        download() {
            try {
                var canvas = document.createElement( 'canvas' )
                canvas.height = 1500
                canvas.width = 1500
                this.draw(canvas, ctx => {
                    ctx.fillStyle = 'black';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                })
                this.drawMapInfo(canvas, canvas.getContext('2d'))
                var img = canvas.toDataURL('image/png')
                this.$gallery([{src: img}], 0)
            } catch(err) {
                this.$snackbar.error({title: err})
            }
        }
    }
}
</script>
<style scoped>
    .dotted-bg {
        border: solid 1px white;
        background-size: 32px 32px;
        background-image: radial-gradient(circle, #000000 1px, rgba(0, 0, 0, 0) 1px);
    }
    .editor-menu {
        position: absolute;
        background: white;
        border-radius: 20px;
    }
    .editor-menu.top {
        height: 60px;
        padding: 0 20px;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        white-space: nowrap;
        overflow: auto;
        max-width: 90%;
    }
    .editor-menu.right {
        color: black;
        width: 60px;
        padding: 20px 0;
        top: 50%;
        right: 10px;
        transform: translateY(-50%);
    }
    .editor-menu .option {
        display: inline-flex;
        width: 60px;
        height: 100%;
        justify-content: center;
        align-items: center;
        vertical-align: top;
    }
    .editor-menu.right .option {
        display: inline-flex;
        width: 100%;
        height: 60px;
        justify-content: center;
        align-items: center;
    }
    .editor-menu .option:hover {
        background: #00000022;
    }
    .option img {
        height: 50px;
    }
    .option > i {
        font-size: 40px;
    }
</style>