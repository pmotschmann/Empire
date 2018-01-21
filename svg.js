SVG.ForiegnObject = function() {
    this.constructor.call(this, SVG.create('foreignObject'));
    this.type = 'foreignObject';
}

SVG.ForiegnObject.prototype = new SVG.Shape;

SVG.extend(SVG.ForiegnObject, {
    appendChild: function (child, attrs) {
        var newChild = typeof(child)=='string' ? document.createElement(child) : child;
        if (typeof(attrs)=='object') {
            for(a in attrs) newChild[a] = attrs[a];
        }
        this.node.appendChild(newChild);
        return this;
    },
        getChild: function (index) {
        return this.node.childNodes[index];
    }
})

SVG.extend(SVG.Container, {
    foreignObject: function(width, height) {
        return this.put(new SVG.ForiegnObject).size(width == null ? 100 : width, height == null ? 100 : height);
    }
})

function createGradient(svg,id,stops){
    var svgNS = svg.namespaceURI;
    var grad  = document.createElementNS(svgNS,'linearGradient');
    grad.setAttribute('id',id);
    for (var i=0;i<stops.length;i++){
        var attrs = stops[i];
        var stop = document.createElementNS(svgNS,'stop');
        for (var attr in attrs){
            if (attrs.hasOwnProperty(attr)) stop.setAttribute(attr,attrs[attr]);
        }
        grad.appendChild(stop);
    }
    
    var defs = svg.querySelector('defs') || svg.insertBefore( document.createElementNS(svgNS,'defs'), svg.firstChild );
    return defs.appendChild(grad);
}

function generateMap(biome, size) {
    var rings = size - 1;
    var terrain = {};
    for (var x=(rings * -1); x <= rings; x++) {
        terrain[x] = {};
        for (var y=(rings * -1); y <= rings; y++) {
            terrain[x][y] = {};
            for (var z=(rings * -1); z <= rings; z++) {
                if (x + y + z === 0) {
                    // Scenary (trees, rocks, etc)
                    switch (Math.floor(Math.random() * 5)) {
                        case 0: // Trees
                            terrain[x][y][z] = calcDebris(['tree1','tree2','tree3','tree4'],1,5);
                            break;
                        case 1: // Lots of Trees
                            terrain[x][y][z] = calcDebris(['tree1','tree2','tree3','tree4'],3,8);
                            break;
                        case 2: // Rocks
                            terrain[x][y][z] = calcDebris(['rock1','rock2','rock3'],1,3);
                            break;
                        case 3: // Rocks and Trees
                            terrain[x][y][z] = calcDebris(['tree1','tree2','tree3','tree4','rock1','rock2','rock3'],4,8);
                            break;
                        case 4: // Open Field
                            terrain[x][y][z] = {};
                            break;
                        default:
                            break;
                    }
                }
            }
        }
    }
    
    // Starting campfire
    terrain[0][0][0] = [{
        type: 'city_hall', // Building type
        svg: 'campfire',  // SVG image
        x: 0,             // X offset on tile
        y: 0              // Y offset on tile
    }];
    
    return terrain;
}

function hexGrid(town, svg) {
    var rings = town['size'];
    var scale = town['scale'];
    
    var centerH = rings * scale * 4 - scale;
    var centerV = rings * scale * 3;
    svg.size(centerH * 2, centerV * 2);
    
    doodads = [];
    for (var x=((rings - 1) * -1); x <= (rings - 1); x++) {
        for (var y=((rings - 1) * -1); y <= (rings - 1); y++) {
            for (var z=((rings - 1) * -1); z <= (rings - 1); z++) {
                if (x + y + z === 0) {
                    drawHexAt(doodads, town, svg, scale, centerH + ((x - y) * scale * 2), centerV + (z * scale * 3),x,y,z);
                }
            }
        }
    }
    
    doodads = doodads.sort(function (a, b) { return a.y - b.y; });
    
    for (var i=0; i<doodads.length; i++) {
        var fobj = svg.foreignObject(scale * doodads[i].s, scale * doodads[i].s);
        var offset = ((scale * doodads[i].s) - scale) / 2;
        fobj.move(doodads[i].x - offset, doodads[i].y - offset);
        fobj.appendChild('div');
        var obj = $('#'+fobj.node.id+' div');
        obj.addClass('svg-img');
        obj.addClass(doodads[i].i);
        obj.attr('data-x',doodads[i].mx);
        obj.attr('data-y',doodads[i].my);
        obj.attr('data-z',doodads[i].mz);
        if (town.map[doodads[i].mx][doodads[i].my][doodads[i].mz][0] && town.map[doodads[i].mx][doodads[i].my][doodads[i].mz][0].type !== 'debris') {
            var type = town.map[doodads[i].mx][doodads[i].my][doodads[i].mz][0].type;
            obj.attr('data-type',type);
            if (type === 'mine') {
                for (var j=0; j<town.mine.length; j++) {
                    if (town.mine[j].id === doodads[i].id) {
                        obj.attr('data-index',j);
                        if (global['status_reports']) {
                            obj.on('mouseover',function(e){
                                var index = $(this).data('index');
                                $('#info-box').css('display','block');
                                $('#info-box').css('top',e.pageY-$('#info-box').height()-30);
                                $('#info-box').css('left',e.pageX-($('#info-box').width())/2);
                                $('#info-box').empty();
                                
                                var rank = town.mine[index]['rank'];
                                var report = $('<div></div>');
                                var title = $('<div>' + town.mine[index].name + '</div>');
                                report.append(title);
                                
                                if (global['overseer'] >= 2 && building['mine']['rank'][rank]['manager']) {
                                    var manager = $('<div>' + town.mine[index].manager + '/1 ' + jobs['manager']['title'] + '</div>');
                                    report.append(manager);
                                }
                                var workers = $('<div>' + town.mine[index].workers + '/' + building['mine']['rank'][rank]['labor_cap'] + ' ' + jobs[building['mine']['rank'][rank]['labor']]['title'] + '</div>');
                                report.append(workers);
                                
                                $('#info-box').append(report);
                            });
                            obj.on('mouseleave',function(e){
                                $('#info-box').css('display','none');
                            });
                        }
                        else {
                            obj.attr('title',town.mine[j].name);
                        }
                        break;
                    } 
                }
            }
            else if (town[type]) {
                if (global['status_reports']) {
                    obj.on('mouseover',function(e){
                        $('#info-box').css('display','block');
                        $('#info-box').css('top',e.pageY-$('#info-box').height()-30);
                        $('#info-box').css('left',e.pageX-($('#info-box').width())/2);
                        $('#info-box').empty();
                        
                        var type = $(this).data('type');
                        var rank = town[type]['rank'];
                        var report = $('<div></div>');
                        var title = $('<div>' + building[type]['rank'][rank]['name'] + '</div>');
                        report.append(title);
                        
                        if (global['overseer'] >= 2 && building[type]['rank'][rank]['manager']) {
                            var manager = $('<div>' + town[type]['manager'] + '/1 ' + jobs['manager']['title'] + '</div>');
                            report.append(manager);
                        }
                        if (global['overseer'] && building[type]['rank'][rank]['foreman']) {
                            var foreman = $('<div>' + town[type]['foreman'] + '/1 ' + jobs['foreman']['title'] + '</div>');
                            report.append(foreman);
                        }
                        if (town[type]['workers']) {
                            var workers = $('<div>' + town[type]['workers'] + '/' + building[type]['rank'][rank]['labor_cap'] + ' ' + jobs[building[type]['rank'][rank]['labor']]['title'] + '</div>');
                            report.append(workers);
                        }
                        if (type === 'city_hall' && global['economics'] >= 5 && town['city_hall'].rank >= 1) {
                            var accountant = $('<div>' + town[type]['accountant'] + '/1 ' + jobs['accountant']['title'] + '</div>');
                            report.append(accountant);
                        }
                        
                        $('#info-box').append(report);
                    });
                    obj.on('mouseleave',function(e){
                        $('#info-box').css('display','none');
                    });
                }
                else {
                    obj.attr('title',building[type]['rank'][town[type]['rank']]['name']);
                }
            }
        }
        else if (doodads[i].i === 'sign') {
            if (global['status_reports']) {
                obj.attr('data-index',i);
                obj.on('mouseover',function(e){
                    var index = $(this).data('index');
                    $('#info-box').css('display','block');
                    $('#info-box').css('top',e.pageY-$('#info-box').height()-30);
                    $('#info-box').css('left',e.pageX-($('#info-box').width())/2);
                    $('#info-box').empty();
                    
                    var report = $('<div></div>');
                    var prospect_id = String(doodads[index].mx) + String(doodads[index].my) + String(doodads[index].mz);
                    var mineral = Object.keys(town.prospecting_offer[prospect_id]).reduce(function(a, b){ return town.prospecting_offer[prospect_id][a] > town.prospecting_offer[prospect_id][b] ? a : b });
                    
                    var prefix = '';
                    if (town['prospecting_offer'][prospect_id][mineral] > 50000) {
                        prefix = 'Rich ';
                    }
                    else if (town['prospecting_offer'][prospect_id][mineral] > 5000) {
                        prefix = 'Adundent ';
                    }
                    else if (town['prospecting_offer'][prospect_id][mineral] > 1000) {
                        prefix = '';
                    }
                    else if (town['prospecting_offer'][prospect_id][mineral] > 500) {
                        prefix = 'Poor ';
                    }
                    else {
                        prefix = 'Worthless ';
                    }
                    
                    var title = $('<div>Prospective ' + prefix + nameCase(mineral) + ' Mine</div>');
                    report.append(title);
                    
                    $('#info-box').append(report);
                });
                obj.on('mouseleave',function(e){
                    $('#info-box').css('display','none');
                });
            }
            else {
                obj.attr('title','Prospected Location');
            }
        }
        
        obj.on('click', function(e) {
            e.preventDefault();
            tileInfo(town,$(this).data('x'),$(this).data('y'),$(this).data('z'));
        });
    }
}

function offsets(town, type, rank, current) {
    switch (type) {
        case 'small_house':
        case 'shed':
            switch (current) {
                case 0:
                    return { x:-20, y:-5 };
                    break;
                case 1:
                    return { x:-5, y:10 };
                    break;
                case 2:
                    return { x:15, y:0 };
                    break;
                case 3:
                    return { x:0, y:-15 };
                    break;
                case 4:
                    return { x:-35, y:-20 };
                    break;
                case 5:
                    return { x:-15, y:-30 };
                    break;
                case 6:
                    return { x:10, y:25 };
                    break;
                case 7:
                    return { x:30, y:15 };
                    break;
                case 8:
                    return { x:-22, y:20 };
                    break;
                case 9:
                    return { x:-37, y:5 };
                    break;
                case 10:
                    return { x:20, y:-25 };
                    break;
                case 11:
                    return { x:35, y:-10 };
                    break;
            }
            break;
        case 'medium_house':
        case 'warehouse':
            switch (current) {
                case 0:
                    return { x:-20, y:10 };
                    break;
                case 1:
                    return { x:20, y:-20 };
                    break;
                case 2:
                    return { x:-20, y:-20 };
                    break;
                case 3:
                    return { x:20, y:10 };
                    break;
            }
            break;
        default:
            return { x:0, y:0 };
            break;
    }
}

function calcContent(doodads, town, svg, element, mx, my, mz, s, x, y) {
    for (var i=0; i<town.map[mx][my][mz].length; i++) {
        var obj = town.map[mx][my][mz][i];
        var entity = {
            x: x + (obj.x * (s / 25)) - (s / 2),
            y: y + (obj.y * (s / 25)) - (s / 2),
            s: 1, // default scale size
            mx: mx,
            my: my,
            mz: mz
        };
        switch (obj.svg) {
            case 'campfire': 
                entity['i'] = 'campfire';
                entity['s'] = 1.25;
                break;
            case 'cityhall': 
                entity['i'] = 'cityhall';
                entity['s'] = 2;
                break;
            case 'mine-grey': 
                entity['i'] = 'mine-grey';
                entity['s'] = 2;
                entity['id'] = obj.id;
                break;
            case 'farm': 
                entity['i'] = 'farm';
                entity['s'] = 2.5;
                break;
            case 'tradepost': 
                entity['i'] = 'tradepost';
                entity['s'] = 1.75;
                break;
            case 'lumbermill': 
                entity['i'] = 'lumbermill';
                entity['s'] = 2.5;
                break;
            case 'rockquarry': 
                entity['i'] = 'factory'; // placeholder
                entity['s'] = 1.5;
                break;
            case 'cementfactory': 
                entity['i'] = 'cementplant';
                entity['s'] = 2;
                break;
            case 'steelmill': 
                entity['i'] = 'steelmill';
                entity['s'] = 2.5;
                break;
            case 'university': 
                entity['i'] = 'university';
                entity['s'] = 1.75;
                break;
            case 'hut': 
                entity['i'] = 'hut';
                entity['s'] = 0.75;
                break;
            case 'shed': 
                entity['i'] = 'shed';
                entity['s'] = 0.75;
                break;
            case 'apartments': 
                entity['i'] = 'condos';
                entity['s'] = 1.4;
                break;
            case 'house': 
                entity['i'] = 'house';
                break;
            case 'warehouse': 
                entity['i'] = 'warehouse';
                entity['s'] = 1.25;
                break;
            case 'sign':
                entity['i'] = 'sign';
                break;
            case 'tree0': // Tree type 0 
                entity['i'] = 'tree0';
                break;
            case 'tree1': // Tree type 1 
                entity['i'] = 'tree1';
                break;
            case 'tree2': // Tree type 2 
                entity['i'] = 'tree2';
                break;
            case 'tree3': // Tree type 3 
                entity['i'] = 'tree3';
                break;
            case 'tree4': // Tree type 4 
                entity['i'] = 'tree4';
                break;
            // disabled becasue it looks terrible
            /*case 'rock0': // Rock type 0 
                entity['i'] = 'rock';
                break;*/
            case 'rock1': // Rock type 1 
                entity['i'] = 'rock1';
                break;
            case 'rock2': // Rock type 2 
                entity['i'] = 'rock2';
                break;
            case 'rock3': // Rock type 3 
                entity['i'] = 'rock3';
                break;
            default:
                break;
        }
        if (entity['i']) {
            doodads.push(entity);
        }
    }
}

function drawHexAt(doodads, town, svg, s, x, y, mx, my, mz) {
    var coord = 'M' + x + ' ' + y;
    var d = s * 2;
    var hex = svg.path(coord + ' m0 -' + d + ' l' + d + ' ' + s + ' v' + d + ' l-' + d + ' ' + s + ' l-' + d + ' -' + s + ' v-' + d +  ' z');
    
    hex.attr({ fill: biomes[town.biome].tile_color, stroke: "#000" });
    hex.data('x',mx);
    hex.data('y',my);
    hex.data('z',mz);
    
    calcContent(doodads, town, svg, hex, mx, my, mz, s, x, y);
    
    if (town.prospecting_offer[String(mx)+String(my)+String(mz)]) {
        doodads.push({
            i: 'sign',
            x: x - (s / 2),
            y: y - (s / 2),
            s: 1,
            mx: mx,
            my: my,
            mz: mz
        });
    }
    
    hex.on('mouseover',function(e){
        this.fill({ color: '#0c8' });
        if (global['debug']) {
            $('#info-box').css('display','block');
            $('#info-box').html(this.data('x') + ' ' + this.data('y') + ' ' + this.data('z'));
            $('#info-box').css('top',e.pageY-$('#info-box').height()-30);
            $('#info-box').css('left',e.pageX-($('#info-box').width())/2);
        }
    });
    
    hex.on('mouseleave',function(e){
        this.fill({ color: biomes[town.biome].tile_color });
        if (global['debug']) {
            $('#info-box').css('display','none');
        }
    });
    
    hex.on('click', function(e) {
        e.preventDefault();
        tileInfo(town,this.data('x'),this.data('y'),this.data('z'));
    });
}
