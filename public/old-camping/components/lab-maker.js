function getCoords(e,size) {
    const { x, y } = e.target.getBoundingClientRect();
    const mouseX = e.clientX - x;
    const mouseY = e.clientY - y;
    return [Math.floor(mouseX / size), Math.floor(mouseY / size)];
}
function drawStroked(text, size, x, y, ctx,color) {
    ctx.font = size+"px Sans-serif"
    if (color && color[0]) ctx.strokeStyle = color[0];
    ctx.lineWidth = size/11;
    ctx.strokeText(text, x, y);
    if (color && color[1]) ctx.fillStyle = color[1];
    else ctx.fillStyle = 'white';
    ctx.fillText(text, x, y);
}
Vue.component('route-maker', {
    name: 'route-maker',
    props: {
      renderCanvas: {
        type: Boolean,
        required: false,
        default: false
      }
    },
    data: function () {
        return {
            VERSION: 1.1,
            maps: [],
            firstRender: true,
            dev: false, /* true will enable map editing */
            hideRouteMenu: false,
            mode: 'route', /* */
            eventOptions: [{type: null, name: null}, {type: 'start', name: 'Start'},{type: 'tp', name: 'Teleport'}, {type: 'shop', name: 'Shop'}, {type: 'battle', name: 'Battle'}, {type: 'mini-boss', name: 'Mini-boss'}, {type: 'boss', name: 'Boss Battle'}, {type: 'portal', name: 'Portal'}, {type: 'lock', name: 'Locked'}],
            eventType: 0, /* if mode = event eventOptions[eventType] */
            setLink: [], /* [key1, key2] temporary -> connection betwween 2 cells*/
            cellTextInput: {display: false, cell: null, value: ''},
            lockOrientation: 0, /* up,right,down,left */
            canvas: this.$refs.route_canvas,
            cellSize: 32,
            mapSize: 46, /* Canvas size = mapSize * cellSize */
            currTheme: "white",
            theme: {
                white: {
                    cellStroke: 'grey',
                    cellStrokeWidth: 2,
                    lineWidth: 5,
                    null: 'white',//'#e3e0e0',
                    shop: '#4CAF50',
                    battle: '#4a86e8',//'#3ed7f0',
                    'mini-boss': 'yellow',
                    boss: 'red',
                    tp: 'orange',
                    start: 'green',
                    portal: '#01ffff',
                    lock: 'grey'
                },
                dark: {
                    cellStroke: 'grey',
                    cellStrokeWidth: 2,
                    lineWidth: 5,
                    null: 'transparent',
                    shop: '#4CAF50',
                    battle: '#A1AEBD',
                    'mini-boss': 'yellow',
                    boss: 'red',
                    tp: 'orange',
                    start: 'green',
                    portal: '#01ffff'
                }
            },
            isMouseDown: false,
            unlockAllCells: false,
            currentRoute: 0,
            userRoutes: [],
            routesPerCell: {},
            totalMorale: [],
            map: {}
        }
    },
    methods: {
        userMessage: function (message) {
            if (!message) return;
            if (snackbarMessage) {
                snackbarMessage(message);
            };
        },
        changeCellSize: function (size) {
            this.cellSize = size;
            Vue.nextTick(()=>{
                this.draw()
            });
        },
        clearCanvas: function () {
            this.map.data = {};
            this.clearRoutes();
            this.draw();
        },
        newMap: function () {
            this.maps.push({
                name: 'Untitled '+this.maps.length,
                start: null,
                type: 'lab',
                data: {}
            });
            this.map = this.maps[this.maps.length-1];
            this.mode = 'map';
            this.clearRoutes();
            this.draw();
        },
        clearRoutes: function () {
            this.userRoutes = [];
            this.currentRoute = 0;
            this.userRoutes[0] = [this.map.start!=null? this.map.start : '0-0'];
            this.draw();
        },
        deleteRoute: function (n) {
            this.userRoutes.splice(n,1);
            if (this.currentRoute>0) this.currentRoute--;
            this.draw();
        },
        countLinesForCell: function () {
            this.routesPerCell = {};
            for (var i=0;i<this.userRoutes.length; i++) {
                for (var j=0;j<this.userRoutes[i].length; j++) {
                    var currCell = this.userRoutes[i][j];
                    if (!this.routesPerCell[currCell]) this.routesPerCell[currCell] = [0,0];
                    this.routesPerCell[currCell][0]++;
                    this.routesPerCell[currCell][1]++;
                };
            };
        },
        routeColor: function (i) {
            var color = ['red','green','blue','orange','pink','purple','cyian']
            return color[i%color.length];
            //return('#'+Math.floor(i*16777215).toString(16))
        },
        isDeadEnd: function (x,y,cells) {
            var c=0;
            [[x+1,y],[x-1,y],[x,y+1],[x,y-1]].forEach((item,i) => {
                if (cells[item[0]+'-'+item[1]]) c++;
            });
            if (c<2) return true;
            return false;
        },
        isCrossWalk: function (key,cells) {
            var x = Number(key.split(/\b-/)[0]), y = Number(key.split(/\b-/)[1]);
            if (cells[key].crossroad) return true;
            else if ((cells[(x-1)+"-"+y] || cells[(x+1)+"-"+y]) && (cells[x+"-"+(y-1)] || cells[x+"-"+(y+1)]) ) return true;
            if(this.isDeadEnd(x,y,cells)) return true;
            else if (cells[key].type==='tp'||cells[key].type==='portal') return true;
            return false;
        },
        hasTeleported: function (newKey,oldKey) {
            var diffX = Math.abs(Number(newKey.split(/\b-/)[0]) - oldKey.split(/\b-/)[0]);
            var diffY = Math.abs(Number(newKey.split(/\b-/)[1]) - oldKey.split(/\b-/)[1]);
            if (diffX > 1 ||  diffY > 1  || (diffX === 1 && diffY === 1)) return true;
            return false;
        },
        isUnlocked: function (key, i) {
            if (this.unlockAllCells) return true;
            if (!key) return true;
            if (this.userRoutes[i].indexOf(key)!=-1 || (this.userRoutes.some( (item,index) => {if (index>=i)return; return item.includes(key)}))) return true;
            return false;
        },
        addTextCell: function () {
            if (this.$refs.cellTextInput.value!="") this.map.data[this.cellTextInput.cell].text = this.$refs.cellTextInput.value;
            this.cellTextInput.display = false;
            this.cellTextInput.value = '';
            this.cellTextInput.cell = null;
            this.draw();
        },
        calculateMorale: function () {
            var tmp = [];
            for (var i = 0; i < this.userRoutes.length; i++) {
                tmp[i] = 0;
                var v2 = {w: this.userRoutes[i].length-1, c: 0, b: 0, tp: 0, p:0};
                for (var j = 0; j < this.userRoutes[i].length; j++) {
                    if (j===0) continue; //start point
                    var isLast = j===this.userRoutes[i].length-1;
                    var key = this.userRoutes[i][j];
                    var willBackTrack = this.userRoutes[i][j-1] === this.userRoutes[i][j+1];
                    var cell = this.map.data[key];

                    if(cell.type==='tp' && this.hasTeleported(key,this.userRoutes[i][j-1])) v2.tp++;
                    else if (['battle','mini-boss','boss'].includes(cell.type)) {
                        var isCrossWalk = this.isCrossWalk(key,this.map.data);
                        var wasCrossWalk = this.isCrossWalk(this.userRoutes[i][j-1],this.map.data);
                        var isBattleOver = (this.map.type==='raid' && this.userRoutes.some( (item,index) => {if (index>=i)return; return item.includes(key)})) || this.userRoutes[i].indexOf(key)<j;
                        if (!isBattleOver) {
                            if (!isLast) {
                                if (!isCrossWalk) {
                                    if (willBackTrack && !wasCrossWalk) v2.w--;
                                    v2.b++;
                                }
                                    else v2.c++;
                            } else {
                                if (isCrossWalk || wasCrossWalk) null 
                                else v2.w--;
                            };
                        };
                    }
                    else if (cell.type === 'portal' && this.hasTeleported(key,this.userRoutes[i][j-1])) v2.p++;
                    continue;

                    if (cell.type==='tp') { // Applay teleporting cost
                        if (this.hasTeleported(key,this.userRoutes[i][j-1])) tmp[i] += 3;
                        else tmp[i]++;
                        continue;
                    } else if (['battle','mini-boss','boss'].includes(cell.type)) {
                        var isCrossWalk = this.isCrossWalk(key,this.map.data);
                        var wasCrossWalk = this.isCrossWalk(this.userRoutes[i][j-1],this.map.data);
                        var isBattleOver = (this.map.type==='raid' && this.userRoutes.some( (item,index) => {if (index>=i)return; return item.includes(key)})) || this.userRoutes[i].indexOf(key)<j;
                        if (!isBattleOver) {
                            if (!isLast) {
                                tmp[i]++;
                                if (!isCrossWalk) {
                                    if (willBackTrack && !wasCrossWalk) tmp[i]-=2; /* Walking back will cost nothing */
                                    tmp[i]+=6;
                                } else {
                                    tmp[i]+=7;
                                };
                            } else if (isCrossWalk || wasCrossWalk) {
                                tmp[i]++;
                            };
                        } else {
                            tmp[i]++;
                        };
                    } else if (cell.type === 'portal') {
                        if (this.hasTeleported(key,this.userRoutes[i][j-1])) tmp[i] += 0;
                        else tmp[i]++;
                        continue;
                    } else {
                        tmp[i]++;
                    };
                };
                tmp[i] = v2.w-v2.tp + v2.c*7+v2.b*6+v2.tp*3-v2.p;
            };
            //if (this.dev) console.log(v2,'Morale:', v2.w-v2.tp + v2.c*7 + v2.b*6 + v2.tp*3 - v2.p, 'Explore:', v2.w-v2.tp-v2.p, 'Battle:', v2.c*7 + v2.b*6, 'Waypoint:', v2.tp*3);
            this.totalMorale = tmp;
            return tmp;
        },
        downloadJSON: function (data,filename,type) {
            var file = new Blob([data], {type: type});
            if (window.navigator.msSaveOrOpenBlob)
                window.navigator.msSaveOrOpenBlob(file, filename);
            else {
                var a = document.createElement("a"),
                        url = URL.createObjectURL(file);
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                setTimeout(function() {
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);  
                }, 0); 
            }
        },
        moveMap: function (x,y) {
            var tmp={type: this.map.type, start: this.map.start, data: {}};
            Object.keys(this.map.data).forEach((key) => {
                var xy = key.split(/\b-/);
                var posx = Number(xy[0]);
                var posy = Number(xy[1]);
                var newkey = (posx+x)+"-"+(posy+y);
                tmp.data[newkey] = this.map.data[key];
                if (this.map.data[key].ref) {
                    var refxy = this.map.data[key].ref.split(/\b-/);
                    var refx = Number(refxy[0]), refy = Number(refxy[1]);
                    tmp.data[newkey].ref = (refx+x) + '-' + (refy+y);
                };
                if (tmp.data[newkey].lock) {
                    tmp.data[newkey].lock.forEach((item,i) => {
                        if (!item) return;
                        var [lx,ly] = item.split(/\b-/);
                        tmp.data[newkey].lock[i] = (Number(lx)+x)+  '-' +(Number(ly)+y);
                    });
                };
            });
            if (this.map.start!=null) {
                var xy = this.map.start.split(/\b-/);
                var startX = Number(xy[0]), startY = Number(xy[1]);
                tmp.start = (startX+x) + '-' + (startY+y);
            };
            this.map = tmp;
            this.clearRoutes(); // this.draw() is called inside this.clearRoutes()
        },
        thisRouteLine: function (j) {
            var tmp = [/* [x,y,extrax,extray],[x,y,extrax,extray]... */];
            for (var i=0;i<this.userRoutes[j].length;i++) {
                var x = Number(this.userRoutes[j][i].split(/\b-/)[0]);
                var y = Number(this.userRoutes[j][i].split(/\b-/)[1]);
                var cell = this.userRoutes[j][i];
                if (i===0) {
                    tmp.push([x,y,this.cellSize/2, this.cellSize/2]);
                    continue;
                } else {
                    var lastX = Number(this.userRoutes[j][i-1].split(/\b-/)[0]);
                    var lastY = Number(this.userRoutes[j][i-1].split(/\b-/)[1]);
                    var diffX = Math.abs(lastX-x);
                    var diffY = Math.abs(lastY-y);
                    var inCellPos = this.routesPerCell[cell][0]!=0?this.cellSize/(this.routesPerCell[cell][0]+1)*(this.routesPerCell[cell][1] || 0) : this.cellSize/2;
                    if (diffX===0 && diffY===1) {
                        tmp.push([x,y,inCellPos,this.cellSize/2]);
                    } else {
                        tmp.push([x,y,this.cellSize/2,inCellPos]);
                    };
                };
                this.routesPerCell[cell][1]--;
            };
            return tmp;
        },
        drawRoutes: function () {
            var ctx = this.ctx;
            this.countLinesForCell();
            for (var j=0; j<this.userRoutes.length; j++) {
                var lines = this.thisRouteLine(j);
                for (var i=0;i<lines.length;i++) {
                    ctx.beginPath();
                    ctx.setLineDash([]);
                    if (i!=0) {
                        if (Math.abs(lines[i][0]-lines[i-1][0])>1 || Math.abs(lines[i][1]-lines[i-1][1])>1 ) ctx.setLineDash([10,10]);
                        ctx.moveTo(lines[i-1][0]*this.cellSize+lines[i-1][2],lines[i-1][1]*this.cellSize+lines[i-1][3]);
                        ctx.lineTo(lines[i][0]*this.cellSize+lines[i][2],lines[i][1]*this.cellSize+lines[i][3]);
                        ctx.lineWidth = this.pathLineWidth;
                        ctx.strokeStyle = this.routeColor(j);
                    } else { // start
                        ctx.font = `${this.cellSize/1.2}px Arial`;
                        ctx.fillStyle = 'red';
                        ctx.textAlign = 'center';
                        ctx.fillText('★', lines[i][0]*this.cellSize+this.cellSize/2, lines[i][1]*this.cellSize+this.cellSize-8);
                        ctx.textAlign = 'start';
                    };
                    ctx.stroke();
                };
            };
            if (this.map.data[this.map.start] && this.map.data[this.userRoutes[this.currentRoute].slice(-1)[0]].type==='portal') {
                var cell = this.map.data[this.userRoutes[this.currentRoute].slice(-1)[0]].ref;
                if (this.map.data[this.userRoutes[this.currentRoute].slice(-2,-1)[0]].type!='portal') {
                    var [x,y] = cell.split(/\b-/);
                    ctx.beginPath();
                    ctx.rect(x*this.cellSize, y*this.cellSize, this.cellSize, this.cellSize);
                    ctx.strokeStyle = 'pink';
                    ctx.stroke();
                };
            };
            var morale = this.calculateMorale();
            var baseMorale = this.map.type==='raid'?100:80;
            morale.forEach( ( route, i )=>{
                ctx.font = "30px Arial";
                ctx.fillStyle = this.routeColor(i);
                ctx.fillText("Route " + (i+1) + ": " + (route-baseMorale>0?route-baseMorale : 0)+ " (" + route + ")", 10, 50*(1+i));
            });
            [{txt: '★', name: 'Start'}, {txt: '💰', name: 'Chest'}].map( (item,i) =>  {
                ctx.font = this.cellSize + "px Arial";
                ctx.fillStyle = 'red';
                ctx.textAlign = 'center';
                ctx.fillText(item.txt, (this.mapSize-7)*this.cellSize+this.cellSize/2, this.cellSize*(i+1)+10);
                ctx.textAlign = 'start';
                ctx.fillText(item.name, (this.mapSize-6)*this.cellSize+this.cellSize/2, this.cellSize*(i+1)+10);
            });
            [2,3,7,4,5,6].map( (key,i) => {
                ctx.beginPath();
                ctx.setLineDash([]);
                ctx.fillStyle = this.theme[this.currTheme][this.eventOptions[key].type];
                ctx.rect((this.mapSize-7)*this.cellSize, this.cellSize*(i+1)+this.cellSize*1+15, this.cellSize, this.cellSize);
                ctx.fill();
                ctx.lineWidth = this.theme[this.currTheme].cellStrokeWidth;
                ctx.strokeStyle = this.theme[this.currTheme].cellStroke;
                ctx.font = this.cellSize + "px Arial";
                ctx.fillText(this.eventOptions[key].name, (this.mapSize-6)*this.cellSize+this.cellSize/2, this.cellSize+this.cellSize*(1+i)+this.cellSize*1+10); 
                ctx.stroke();
            });
        },
        drawIcons: function (p,cell) {
            var ctx = this.ctx;
            if (cell.text) {
                let l = cell.text.length;
                ctx.fillStyle = 'black';
                ctx.textAlign = 'center';
                //ctx.fillText(cell.text, p[0]*this.cellSize+this.cellSize/2, p[1]*this.cellSize+this.cellSize-8);
                drawStroked(cell.text, Math.ceil(this.cellSize/1.7), p[0]*this.cellSize+this.cellSize/2,p[1]*this.cellSize+this.cellSize-8, ctx,['black','white'])
                ctx.textAlign = 'start';
            };
        },
        drawLockWalls: function (p,cell,ctx) {
            if (this.unlockAllCells) return;
            if (!cell.lock) return;
            if (!Array.isArray(cell.lock)) return;
            ctx.beginPath();
            ctx.lineWidth = this.pathLineWidth*1.5;
            ctx.strokeStyle = 'red';
            ctx.font = `${this.cellSize/1.7}px Arial`;
            ctx.fillStyle = 'purple';
            if (cell.lock[0] && !this.isUnlocked(cell.lock[0],this.currentRoute)) {//top
                ctx.moveTo(p[0]*this.cellSize,p[1]*this.cellSize);
                ctx.lineTo(p[0]*this.cellSize+this.cellSize,p[1]*this.cellSize);
                if (this.map.data[cell.lock[0]].text) {
                    drawStroked(this.map.data[cell.lock[0]].text.slice(2), this.cellSize/1.7, p[0]*this.cellSize+this.cellSize+5, p[1]*this.cellSize, ctx)
                    //ctx.fillText(this.map.data[cell.lock[0]].text.slice(2), p[0]*this.cellSize+this.cellSize+5,p[1]*this.cellSize);
                };
            };
            if (cell.lock[1] && !this.isUnlocked(cell.lock[1],this.currentRoute)) {//right
                ctx.moveTo(p[0]*this.cellSize+this.cellSize,p[1]*this.cellSize);
                ctx.lineTo(p[0]*this.cellSize+this.cellSize,p[1]*this.cellSize+this.cellSize);
                if (this.map.data[cell.lock[1]].text) {
                    drawStroked(this.map.data[cell.lock[1]].text.slice(2), this.cellSize/1.7, p[0]*this.cellSize+this.cellSize,p[1]*this.cellSize+this.cellSize+20, ctx)
                    //ctx.fillText(this.map.data[cell.lock[1]].text.slice(2), p[0]*this.cellSize+this.cellSize,p[1]*this.cellSize+this.cellSize+20);
                };
            };
            if (cell.lock[2] && !this.isUnlocked(cell.lock[2],this.currentRoute)) {//bottom
                ctx.moveTo(p[0]*this.cellSize,p[1]*this.cellSize+this.cellSize);
                ctx.lineTo(p[0]*this.cellSize+this.cellSize,p[1]*this.cellSize+this.cellSize);
                if (this.map.data[cell.lock[2]].text) {
                    ctx.textAlign = 'right';
                    drawStroked(this.map.data[cell.lock[2]].text.slice(2), this.cellSize/1.7, p[0]*this.cellSize-5,p[1]*this.cellSize+this.cellSize, ctx)
                    //ctx.fillText(this.map.data[cell.lock[2]].text.slice(2), p[0]*this.cellSize-5,p[1]*this.cellSize+this.cellSize);
                };
            };
            if (cell.lock[3] && !this.isUnlocked(cell.lock[3],this.currentRoute)) {//left
                ctx.moveTo(p[0]*this.cellSize,p[1]*this.cellSize);
                ctx.lineTo(p[0]*this.cellSize,p[1]*this.cellSize+this.cellSize);
                if (this.map.data[cell.lock[3]].text) {
                    drawStroked(this.map.data[cell.lock[3]].text.slice(2), this.cellSize/1.7, p[0]*this.cellSize,p[1]*this.cellSize-5, ctx)
                    //ctx.fillText(this.map.data[cell.lock[3]].text.slice(2), p[0]*this.cellSize,p[1]*this.cellSize-5);
                };
            };
            ctx.textAlign = 'start';
            ctx.lineWidth = this.pathLineWidth;
            ctx.stroke();
        },
        draw: function () {
            var ctx = this.ctx;
            var canvas = this.$refs.route_canvas;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.lineWidth = 1;
            Object.keys(this.map.data).forEach((key) => {
                var positionX = Number(key.split(/\b-/)[0]);
                var positionY = Number(key.split(/\b-/)[1]);
                ctx.beginPath();
                ctx.setLineDash([]);
                ctx.rect(positionX * this.cellSize, positionY * this.cellSize, this.cellSize, this.cellSize);
                ctx.fillStyle = this.theme[this.currTheme][this.map.data[key].type] || 'white';
                ctx.fill();
                ctx.lineWidth = this.theme[this.currTheme].cellStrokeWidth;
                ctx.strokeStyle = this.theme[this.currTheme].cellStroke;
                ctx.stroke();
                if (this.dev && this.isCrossWalk(key,this.map.data)) {
                    ctx.font = `${this.cellSize/1.7}px Arial`;
                    ctx.fillStyle = 'purple';ctx.fillText('x', positionX*this.cellSize,positionY*this.cellSize+this.cellSize/2-5);
                }
            });
            Object.keys(this.map.data).forEach((key) => {
                var positionX = Number(key.split(/\b-/)[0]);
                var positionY = Number(key.split(/\b-/)[1]);
                this.drawLockWalls([positionX,positionY],this.map.data[key],ctx);
                this.drawIcons([positionX,positionY],this.map.data[key]);
            });
            this.drawRoutes();
        },
        handleMuseEvent: function (event) {
            if (this.isMouseDown)
                this.addTile(event)
            else { // mouseover event
            };
        },
        addTile: function (mouseEvent) {
            var clicked = getCoords(mouseEvent, this.cellSize);
            var key = clicked[0] + "-" + clicked[1];
            if (mouseEvent.ctrlKey && mouseEvent.shiftKey) {
                this.dev = true;
            };
            if (this.mode==='map') {
                if (mouseEvent.shiftKey) {
                    if (!this.map.data[key]) return;
                    delete this.map.data[key];
                } else {
                    if (this.map.data[key]) return;
                    this.map.data[key] = {
                        type: null
                    };
                };
            } else if (this.mode==='route') {
                if (this.userRoutes.length===0) this.userRoutes = [[this.map.start]];
                if (!this.userRoutes[this.currentRoute] || this.userRoutes[this.currentRoute].length===0) this.userRoutes[this.currentRoute] = [this.map.start];
                if (mouseEvent.shiftKey) {
                    for (var i=this.userRoutes[this.currentRoute].length-1; i>=0; i--) {
                        if (this.userRoutes[this.currentRoute][i]===key) {
                            this.userRoutes[this.currentRoute].splice(i);
                            break;
                        };
                    };
                    if (this.userRoutes[this.currentRoute].length<1) this.userRoutes[this.currentRoute] = [this.map.start];
                } else {
                    let lastKey = this.userRoutes[this.currentRoute][this.userRoutes[this.currentRoute].length-1];
                    if (lastKey===key) return;
                    if (!this.map.data[key])  return; /* Out of borders */
                    if (this.hasTeleported(key,lastKey )) { /* Too far from last point */
                        if (this.map.data[key].type!="tp" && this.map.data[key].type!="portal") return;
                        else if (this.map.data[key].type==="portal" && this.map.data[lastKey].ref!=key) return;
                    };
                    if (this.map.data[lastKey].lock||this.map.data[key].lock) {
                        let i=-1, target = this.map.data[lastKey].lock;
                        let old = lastKey.split(/\b-/), diffX = clicked[0] - Number(old[0]), diffY = clicked[1] - Number(old[1]);
                        if (target) {
                            if (diffY===-1) i=0;
                            else if (diffX===1) i=1;
                            else if (diffY===1) i=2;
                            else if (diffX===-1) i=3;
                            if (!this.isUnlocked(target[i],this.currentRoute)) return; // locked
                        };
                        if (this.map.data[key].lock) {
                            i=-1;
                            diffX=diffX*-1;
                            diffY=diffY*-1;
                            target = this.map.data[key].lock;
                            if (diffY===-1) i=0;
                            else if (diffX===1) i=1;
                            else if (diffY===1) i=2;
                            else if (diffX===-1) i=3;
                            if (!this.isUnlocked(target[i],this.currentRoute)) return; // locked
                        };
                    };
                    this.userRoutes[this.currentRoute].push(key);
                };
            } else if (this.mode === 'events') {
                if (!this.map.data[key]) return;
                if (mouseEvent.shiftKey) {
                    this.map.data[key].type = null;
                    delete this.map.data[key].ref;
                    delete this.map.data[key].lock;
                } else {
                    switch (this.eventOptions[this.eventType].type) {
                        case 'start':
                            this.map.start = key;
                            this.clearRoutes();
                            break;
                        case 'lock':
                            if (this.setLink.includes(key)) return;
                            this.setLink.push(key);
                            if (this.setLink.length===2) {
                                /*
                                this.map.data[this.setLink[0]].type = this.eventOptions[this.eventType].type;
                                this.map.data[this.setLink[0]].ref = this.setLink[1];
                                */
                                if (!this.map.data[this.setLink[0]].lock) this.map.data[this.setLink[0]].lock = [0,0,0,0];
                                this.map.data[this.setLink[0]].lock[this.lockOrientation] = this.setLink[1];
                                this.setLink = [];
                            };
                            break;
                        case 'portal':
                            if (this.setLink.includes(key)) return;
                            this.setLink.push(key);
                            if (this.setLink.length===2) {
                                this.map.data[this.setLink[0]].type = this.eventOptions[this.eventType].type;
                                this.map.data[this.setLink[1]].type = this.eventOptions[this.eventType].type;
                                this.map.data[this.setLink[0]].ref = this.setLink[1];
                                this.map.data[this.setLink[1]].ref = this.setLink[0];
                                this.setLink = [];
                            };
                            break;
                        default:
                            this.map.data[key].type = this.eventOptions[this.eventType].type;
                    };
                };
            } else if (this.mode==='crossroad') {
                if (mouseEvent.shiftKey) {
                    delete this.map.data[key].crossroad;
                } else {
                    this.map.data[key].crossroad = true;
                };
            } else if (this.mode==='text') {
                if (mouseEvent.shiftKey) {
                    delete this.map.data[key].text;
                } else {
                    if (!this.map.data[key]) return;
                    this.cellTextInput.value=this.map.data[key].text || '';
                    this.cellTextInput.cell = key;
                    this.$refs.cellTextInput.value = this.cellTextInput.value;
                    this.cellTextInput.display = true;
                    Vue.nextTick(()=>this.$refs.cellTextInput.focus());
                    return; // no need to redraw
                };
            };
            this.draw();
        },
        bootOptions: function () {
            this.map = this.maps[0];
            this.hideRouteMenu = false;
            Vue.nextTick ( () => {
                this.firstRender = false;
                document.body.classList.add('modal-open');
                this.ctx = this.$refs.route_canvas.getContext('2d');
                this.clearRoutes();
                this.draw();
            });
        }
    },
    watch: {
        dev: function () {
            this.mode = 'route';
            this.eventType = 0;
        },
        renderCanvas: function (status) {
            if (this.renderCanvas===true) {
                if (gtag && this.firstRender) {
                    gtag('event', 'render', {
                        'event_category': 'Map Maker',
                        'event_label': 'First render'
                    });
                };
                if (this.maps.length===0) {
                    var self = this;
                    $.ajax({
                        url: "components/maps.json",
                        type: 'GET',
                        contentType: 'application/json',
                        success: (response) => {
                            self.maps = response;
                            self.bootOptions();
                        },
                        error: (err) => {}
                    });
                } else this.bootOptions();
            } else {
                this.dev = false;
                document.body.classList.remove('modal-open');
            };
        },
        unlockAllCells: function () {
            this.draw();
        }
    },
    mounted: function () {
    },
    computed: {
        pathLineWidth:  function () {
            return Math.ceil(this.cellSize/32*this.theme[this.currTheme].lineWidth);
        }
    },
    render: function (h) {
        if (!this.renderCanvas) 
            return h('span',{on: {click: () => this.renderCanvas = !this.renderCanvas}, style: {overflow: 'hidden', background: 'grey', height: '200px', width: '200px', verticalAlign: 'top', cursor: 'pointer'}}, [
                h('img', {attrs: {src: '../img/Raid-Hell_en.png'}}),
                //h('div', {style: {transform: "rotate(-45deg)", position: 'absolute', boxShadow: '#00000024 0 5px 8px', top: '8px', left: '-30px', padding: '5px 30px', color: 'white', backgroundColor: 'red'}}, 'NEW'),
                h('span','Custom route')
            ]);

        return h('div', {class: 'modal', style: {display: 'block'}}, [
            h('div', {class: 'modal-content', style: {textAlign: 'center', width: '95%', height: '98%', overflow: 'scroll', padding: 0}}, [
                this.renderCanvas ? [
                    h('header', {style: {boxSizing: 'border-box', position: 'sticky', top: 0, left: 0, backgroundColor: 'var(--bg-color)', borderBottom: 'solid #776048', padding: '10px 0', height: '73px'}}, [
                        h('div', {on: {click: () => this.renderCanvas = !this.renderCanvas}, class: 'close', style: {position: 'absolute', right: 0, top: 0, height: '100%', width: '72px', lineHeight: '72px', fontSize: '44px'}}, '×'),
                        this.dev ? h('div', {ref: 'canvasDiv'}, [ 
                            h('button', {on: {click: () => this.mode = 'map'}}, 'Edit Map'),
                            h('button', {on: {click: () => this.mode = 'events'}}, 'Edit Events'),
                            h('button', {on: {click: () => this.mode = 'route'}}, 'Edit Routes'),
                            h('button', {on: {click: () => this.mode = 'crossroad'}}, 'Set Crossroad'),
                            h('button', {on: {click: () => this.moveMap(0,2)}}, 'Move down'),
                            h('button', {on: {click: () => this.moveMap(0,-2)}}, 'Move up'),
                            h('button', {on: {click: () => this.moveMap(-2,0)}}, 'Move left'),
                            h('button', {on: {click: () => this.moveMap(2,0)}}, 'Move right'),
                            h('br'),
                            h('input', {type: 'text', ref: 'cellTextInput', style: {display: this.cellTextInput.display?'inline':'none'}}),
                            !this.cellTextInput.display?h('button', {on: {click: () => {this.mode = 'text',this.userMessage('Select a cell.<br>Press SHIFT + Click to delete the text from a cell.')}}}, 'Add text'):h('button', {on: {click: () => this.addTextCell()}}, 'Add text to '+this.cellTextInput.cell),
                            h('button', {on: {click: () => this.clearCanvas()}}, 'Clear Canvas'),
                            h('button', {on: {click: () => this.newMap()}}, 'New Map'),
                            h('button', {on: {click: () => this.downloadJSON(JSON.stringify(this.map/*, null, 2*/), this.map.name,'.json')}}, 'Download JSON map')
                        ]) : null,
                        this.mode==='events' ? h('div', {}, this.eventOptions.map((x,i) => {
                            return h('button', {on: {click: () => {this.eventType=i,this.setLink=[]} }}, 'Set '+ x.name);
                        })) : null,
                        this.mode==='events'&&this.eventOptions[this.eventType].type==='lock'? h('button', {on: {click: (event) => this.lockOrientation<3?this.lockOrientation++:this.lockOrientation=0}}, ['Up','Right','Down','Left'][this.lockOrientation]) :  null,
                        this.mode==='events'&&this.eventType===7? h('span', this.setLink.length?'Set Destination':'Select Entry point'):null,
                        /*h('button', {on: {click: () => {this.currTheme==='dark' ? this.currTheme='white':this.currTheme='dark';this.draw();}}}, this.currTheme==='white'?'Dark map':'Light map'),
                        [64,40,32,24,16].map(x => {return h('button', {on: {click: () => this.changeCellSize(x) }}, 'x'+x)}),*/
                        !this.dev?h('span', {class: 'modal-title'}, 'Custom Route Maker v'+this.VERSION):null
                    ]),
                    h('div', {style: {position: 'sticky', top: '73px', left: 0, right: 0}}, [
                        h('div', {class: 'noselect', style: {overflow: 'scroll', overscrollBehavior: 'contain', cursor: 'default', position: 'absolute', left: 0, backgroundColor: 'var(--bg-color)', maxHeight: this.hideRouteMenu?'40px':'300px', borderRadius: '0 0 13px', borderBottom: 'solid', borderRight: 'solid', borderColor: '#776048', width: '250px'}}, 
                            this.maps.length>0?[
                                h('div', this.maps.map(item => {return h('span', {on: {click: () => {this.map = item; this.clearRoutes()} }, style: {display: 'inline-block', width: '50%', padding: '10px 0', backgroundColor: this.map.name===item.name?'var(--bg-color-secondary)':null}}, item.name)}) ),
                                h('div', [
                                    this.map.name&&!this.map.name.indexOf('Nixied') ? h('label', {class: 'check', style: {textAlign: 'initial', fontSize: '16px'}}, [
                                        h('input', {attrs: {type: 'checkbox'}, on: {click: (e) => this.unlockAllCells = e.target.checked}}),
                                        h('span', {class: 'checkmark'}),
                                        'Unlock all cells'
                                    ]) : null
                                ]),
                                h('span', {on: {click: () => {this.userRoutes.push([this.map.start]); this.currentRoute = this.userRoutes.length-1;this.draw()}}, class: 'fa fa-plus', style: {width: '50%', padding: '10px 0'}}, 'New Route'),
                                h('span', {on: {click: this.clearRoutes}, class: 'fa fa-trash', style: {width: '50%', padding: '10px 0'}}, 'Delete all'),
                                this.userRoutes.map( (x,i) => {
                                    return h('div', {on: {click: () => { this.currentRoute = i;}}, style: {backgroundColor: this.currentRoute===i?'var(--bg-color-secondary)':null, color: this.routeColor(i), textAlign: 'initial', padding: '15px'}}, [
                                        h('span', {}, `Route ${i+1} (${(this.map.type==='raid'?100:80)-this.totalMorale[i]<0?Math.abs((this.map.type==='raid'?100:80)-this.totalMorale[i]):0})`),
                                        h('i', {on: {click: () => this.deleteRoute(i)}, class: 'fa fa-trash', style: {float: 'right'}})
                                    ]);
                                }),
                                h('div', {on: {click: () => this.hideRouteMenu = !this.hideRouteMenu}, class: !this.hideRouteMenu?'fa fa-angle-double-up':'fa fa-angle-double-down',style: {cursor: 'pointer', position: 'sticky', height: '40px', width: '100%', bottom: 0, backgroundColor: '#776048', fontSize: '35px', color: 'white'}}),
                            ]:null
                        )
                    ]),
                    h('p',{style: {textAlign: 'center', marginTop: '45px'}}, [
                        h('b', 'Click'),
                        ' (and hold) to start drawing your route.',
                        h('br'),
                        h('b', 'Hold SHIFT'),
                        ' and click to remove part of your route.',
                        h('br'),
                        h('b', 'You can right click and select "Save image as..." if you want to save your work.'),
                        h('br'),
                        h('i', 'Last fight\'s morale will not be included.'),
                        h('br'),
                        h('b', {style: {fontSize: '20px'}}, 'If you encounter any problems with this tool feel free to contact me on discord: gio#0898')
                    ]),
                    this.maps.length===0? h('div', {style: {fontSize:'34px'}}, 'Downloading maps...'):null,
                    h('canvas', {ref: 'route_canvas', on: {mousedown: (event) => {this.isMouseDown = true; this.addTile(event)}, mousemove: (event) => this.handleMuseEvent(event), mouseup: () => this.isMouseDown = false, mouseleave: () => this.isMouseDown = false}, style: {margin: '30px'/*border: 'solid thin white'*/}, attrs: {height: this.mapSize*this.cellSize, width: this.mapSize*this.cellSize}})
                ] : null
            ])
        ]);
    }
});