// Main game init
$(function() {
    settings();
    
    var global_data = save.getItem('global') || false;
    if (global_data) {
        // Load preexiting game data
        global = JSON.parse(global_data);
    }
    else {
        newGame();
    }
    
    if (!global['research_lab']) {
        $('#research_tab').hide();
    }
    if (Number(global['tech']) < 2) {
        $('#city_info').hide();
        $('#city_menu').hide();
        $('#sub_city').hide();
    }
    
    if (global['debug']) {
        $('#debug').addClass('btn-primary');
        $('#debug').removeClass('btn-secondary');
    }
    
    // Define things
    defineTech();
    defineBuildings();
    
    // Load city progression
    loadCity();
    // Set current research
    loadTech();
    
    if (!global['economics']) {
        $('#city_info .money').hide();
    }
    if (!global['housing']) {
        $('#city_info .citizen').hide();
    }
    
    $(document).on('click', function (e) {
        $('[data-toggle="popover"],[data-original-title]').each(function () {
            if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {                
                (($(this).popover('hide').data('bs.popover')||{}).inState||{}).click = false;  // fix for BS 3.3.6
            }
        });
    });
    
    mainLoop();
});

// Main game loop
function mainLoop() {
    intervals['main'] = setInterval(function() {
        for (var id=0; id < city.length; id++) {
            if (isNaN(city[id]['timer']) || city[id]['timer'] === 0) {
                city[id]['timer'] = 60;
            }
            city[id]['timer'] -= 1;
            
            
            var employed = 0;
            var revenue = 0;
            // Resource mining
            // Uses weird reverse loop so depleted mines can be pruned
            for (var key=city[id]['mine'].length - 1; key >= 0; key--) {
                var mine = city[id]['mine'][key];
                if (global['overseer'] >= 2 && mine['manager'] && mine['manager'] === 1) {
                    employed++;
                    revenue += jobs['manager']['tax'];
                }
                if (city[id].timer % 2 === 0) {
                    building['mine'].produce(city[id],mine);
                }
                employed += mine['workers'];
                revenue += jobs[building['mine']['rank'][mine['rank']]['labor']]['tax'] * mine['workers'];
                
                // Mine is depleted
                if (Object.values(mine['resources']).reduce((a, b) => a + b) === 0) {
                    city[id]['citizen']['idle'] += mine['workers'];
                    $('#' + mine['id']).remove();
                    Object.keys(mine['resources']).forEach(function (res) {
                        unwatch[mine['id'] + res]();
                        delete unwatch[mine['id'] + res];
                    });
                    unwatch[mine['id'] + 'workers']();
                    delete unwatch[mine['id'] + 'workers'];
                    delete vue[mine['id'] + 'workers'];
                    delete vue[mine['id']];
                    city[id].map[mine.x][mine.y][mine.z] = [];
                    city[id]['mine'].splice(key, 1);
                    
                    loadCityMap(id);
                }
            }
            
            // Triggers production
            Object.keys(building).forEach(function (bld) {
                if (building[bld].type === 'mine') {
                    return;
                }
                else if (city[id][bld] && building[bld].produce) {
                    if (global['overseer'] >= 2 && city[id][bld]['manager'] && city[id][bld]['manager'] === 1) {
                        employed++;
                        revenue += jobs['manager']['tax'];
                    }
                    if (global['overseer'] && city[id][bld]['foreman'] && city[id][bld]['foreman'] === 1) {
                        employed++;
                        revenue += jobs['foreman']['tax'];
                        if (city[id].timer % 2 === 0) {
                            building[bld].produce(city[id],bld);
                        }
                    }
                    else if (city[id].timer % 3 === 0) {
                        building[bld].produce(city[id],bld);
                    }
                    employed += city[id][bld]['workers'];
                    revenue += jobs[building[bld]['rank'][city[id][bld]['rank']]['labor']]['tax'] * city[id][bld]['workers'];
                }
                else if (city[id][bld] && building[bld]['rank'][city[id][bld]['rank']].staff) {
                    // needed for employment headcount
                    employed += city[id][bld]['workers'];
                    revenue += jobs[building[bld]['rank'][city[id][bld]['rank']]['labor']]['tax'] * city[id][bld]['workers'];
                }
            });
            
            // Updates storage totals
            var storage_cap = 100;
            if (city[id]['shed']) {
                if (global['packing'] >= 1) {
                    building.shed.rank[0].description = 'A simple shed to store resources, increases city storage limit by 25.';
                    building.shed.rank[1].description = 'A simple shed to store resources, increases city storage limit by 25.';
                    storage_cap += (city[id]['shed'].owned * 25);
                }
                else {
                    building.shed.rank[0].description = 'A simple shed to store resources, increases city storage limit by 20.';
                    building.shed.rank[1].description = 'A simple shed to store resources, increases city storage limit by 20.';
                    storage_cap += (city[id]['shed'].owned * 20);
                }
            }
            if (city[id]['warehouse']) {
                if (global['packing'] >= 2) {
                    building.warehouse.rank[0].description = 'A large storage building, increases city storage limit by 125.';
                    storage_cap += (city[id]['warehouse'].owned * 125);
                }
                else {
                    building.warehouse.rank[0].description = 'A large storage building, increases city storage limit by 100.';
                    storage_cap += (city[id]['warehouse'].owned * 100);
                }
            }
            city[id]['storage_cap'] = storage_cap;
            var storage_sum = Number(Object.keys(city[id]['storage']).length ? Object.values(city[id]['storage']).reduce((a, b) => a + b) : 0);
            $('#cityStorage' + id).html(storage_sum + ' / ' + city[id]['storage_cap']);
            
            // Calculates citizen growth
            if (global['housing'] && city[id].citizen.max > city[id].citizen.amount) {
                var num = (city[id].citizen.amount * 25 * city[id]['tax_rate']) / biomes[city[id].biome].growth;
                var farmers = 1;
                if (city[id].farm) {
                    farmers += city[id].farm.workers;
                }
                if (Math.random() * num < farmers) {
                    city[id].citizen.amount++;
                }
            }
            
            // Prospecting logic
            if (city[id]['prospecting']) {
                city[id]['prospecting']--;
                var prospect_id = String(city[id].prospect_id.x)+String(city[id].prospect_id.y)+String(city[id].prospect_id.z);
                var completion = Math.floor((Math.ceil((city[id].mine.length + 1) * 15 * biomes[city[id].biome].cost) - city[id]['prospecting']) / Math.ceil((city[id].mine.length + 1) * 15 * biomes[city[id].biome].cost) * 100);
                $('#prospecting' + prospect_id + 'title').html('Prospecting ' + completion + '%');
                
                if (city[id]['prospecting'] === 0) {
                    city[id]['prospecting'] = false;
                    var mine = {};
                    Object.keys(biomes[city[id].biome].minerals).forEach(function (ore) {
                        if (Math.random() < biomes[city[id].biome]['minerals'][ore]) {
                            mine[ore] = Math.ceil(Math.random() * 2000 * biomes[city[id].biome]['minerals'][ore]);
                            // Chance to strike a rich ore vein
                            var roll = Math.random() * 100;
                            if (roll > 99) {
                                // Super Rich
                                mine[ore] *=  Math.ceil(Math.random() * 250);
                            }
                            else if (roll > 95) {
                                // Rich
                                mine[ore] *=  Math.ceil(Math.random() * 100);
                            }
                            else if (roll > 90) {
                                // Above Average
                                mine[ore] *=  Math.ceil(Math.random() * 10);
                            }
                        }
                    });
                    city[id]['prospecting_offer'][prospect_id] = mine;
                    tileInfo(city[id], city[id].prospect_id.x, city[id].prospect_id.y, city[id].prospect_id.z);
                }
            }
            
            // Collect taxes
            if (city[id]['timer'] === 0 && global['economics'] >= 2) {
                global['money'] += revenue * city[id]['tax_rate'];
            }
            else if (city[id]['timer'] === 30 && global['economics'] >= 4) {
                global['money'] += revenue * city[id]['tax_rate'];
            }
            
            // Correct labor pool
            city[id].citizen.idle = city[id].citizen.amount - employed;
            
            // Ensure storage is displayed accurately
            Object.keys(city[id]['storage']).forEach(function (key) { 
                if (global['resource'][key] && global['resource'][key].unlocked && $('#storage' + id + ' .' + key).length && global['resource'][key].manual) {
                    // Do nothing
                }
                else if ($('#storage' + id + ' .' + key).length === 0 && (city[id]['storage'][key] > 0 || (global['resource'][key].manual && global['resource'][key].unlocked) ) ) {
                    var clone = {};
                    Object.keys(city[id]['storage']).forEach(function (res) {
                        clone[res] = city[id]['storage'][res];
                    });
                    city[id]['storage'] = clone;
                    Object.keys(unwatch[id]).forEach(function (watcher) {
                        unwatch[id][watcher]();
                        delete unwatch[id][watcher]
                    });
                    vue['storage' + id].$destroy();
                    delete vue['storage' + id];
                    $('#storage' + id).empty();
                    loadCityStorage(id);
                }
                else if (city[id]['storage'][key] === 0 || isNaN(city[id]['storage'][key]) || city[id]['storage'][key] === null) {
                    delete city[id]['storage'][key];
                    if (unwatch[id]['storage' + key]) {
                        unwatch[id]['storage' + key]();
                        delete unwatch[id]['storage' + key];
                    }
                    $('#storage' + id + ' .' + key).remove();
                }
            });
        }
        
        // Check for opening features
        if (!global['research_lab'] && city[0]['storage'].lumber >= 2 && city[0]['storage'].stone >= 2) {
            global['research_lab'] = true;
            $('#research_tab').show();
        }
        
        // Save game state
        save.setItem('global',JSON.stringify(global));
        save.setItem('city',JSON.stringify(city));
    }, 1000);
}

function showTech(techKey,techLevel) {
    var tech = $('<div id="' + techKey + 'Clicker" class="tech" title="Research ' + nameCase(research[techKey][techLevel]['name']) +'"></div>');
    var name = $('<div class="name">' + research[techKey][techLevel]['name'] + '</div>');
    var desc = $('<div class="desc">' + research[techKey][techLevel]['description'] + '</div>');
    tech.append(name);
    tech.append(desc);
    Object.keys(research[techKey][techLevel]['cost']).forEach(function (cost) { 
        var row = $('<div class="row"></div>');
        var afford = '';
        var t_cost = research[techKey][techLevel]['cost'][cost];
        if (cost === 'money') {
            if (t_cost > global.money) {
                afford = ' unaffordable';
            }
            var price = $('<span class="col cost' + afford + '" data-' + cost + '="' + t_cost + '">$' + t_cost + '</span>');
            row.append(price);
            tech.append(row);
        }
        else {
            if (t_cost > city[0].storage[cost]) {
                afford = ' unaffordable';
            }
            var res = $('<span class="resource">' + nameCase(cost) + '</span>');
            var price = $('<span class="cost' + afford + '" data-' + cost + '="' + t_cost + '">' + t_cost + '</span>');
            row.append(res);
            row.append(price);
            tech.append(row);
        }
    });
    $('#research div').first().append(tech);
    
    $('#' + techKey + 'Clicker').on('click',function(e){
        e.preventDefault();
        
        var paid = true;
        Object.keys(research[techKey][techLevel]['cost']).forEach(function (cost) {
            if (cost === 'money') {
                if (global['money'] < research[techKey][techLevel]['cost'][cost]) {
                    paid = false;
                    return;
                }
            }
            else if (!city[0]['storage'][cost] || city[0]['storage'][cost] < research[techKey][techLevel]['cost'][cost]) {
                paid = false;
                return;
            }
        });
        if (paid) {
            Object.keys(research[techKey][techLevel]['cost']).forEach(function (cost) {
                if (cost === 'money') {
                    global['money'] -= research[techKey][techLevel]['cost'][cost];
                }
                else {
                    city[0]['storage'][cost] -= research[techKey][techLevel]['cost'][cost];
                }
            });
            if (global[techKey]) {
                global[techKey]++;
            }
            else {
                global[techKey] = 1;
            }
            global['knowledge']++;
            if (research[techKey][techLevel]['effect']) {
                research[techKey][techLevel]['effect']();
            }
            loadTech();
        }
        
        return false;
    });
}

function loadTech() {
    // Load Research Listing
    $('#research div').first().empty();
    Object.keys(research).forEach(function (key) { 
        var techLevel = Number(global[key]) || 0;
        if ( research[key][techLevel] ) {
            if (research[key][techLevel].require) {
                if (checkRequirements(research[key][techLevel].require)) {
                    showTech(key,techLevel);
                }
            }
            else {
                showTech(key,techLevel);
            }
        }
    });
}

function checkRequirements(requirements) {
    var available = true;
    Object.keys(requirements).forEach(function (req) {
        var testTech = Number(global[req]) || 0;
        if (testTech < Number(requirements[req])) {
            available = false;
            return false;
        }
    });
    return available;
}

function inflation(town,struct,cost) {
    if (building[struct].inflation) {
        var owned = 0;
        if (town[struct]) {
            if (town[struct]['owned']) {
                owned = town[struct]['owned'];
            }
            else {
                owned = 1;
            }
        }
        cost += Math.ceil(cost * owned * building[struct].inflation.amount);
    }
    return Math.ceil(cost * biomes[town.biome].cost);
}

function newGame() {
    defineResources();
    global['money'] = 0;
    global['knowledge'] = 0;
    global['next_id'] = 0;
    global['research_lab'] = false;
    global['trading_post'] = false;
    global['tech'] = 0;
}

function settings() {
    $('#export').on('click',function(e){
        e.preventDefault();
        
        var data = JSON.stringify({
            g: global,
            c: city
        });
        
        $('#saveString').val(LZString.compressToBase64(data));
    });
    
    $('#import').on('click',function(e){
        e.preventDefault();
        
        var game_state = JSON.parse(LZString.decompressFromBase64($('#saveString').val()));
        global = game_state['g'];
        city = game_state['c'];
        
        save.setItem('global',JSON.stringify(global));
        save.setItem('city',JSON.stringify(city));
        
        window.location.reload();
    });
    
    $('#reset').on('click',function(e){
        e.preventDefault();
        
        Object.keys(city).forEach(function (id) { 
            Object.keys(unwatch[id]).forEach(function (watcher) {
                unwatch[id][watcher]();
                delete unwatch[id][watcher]
            });
            delete unwatch[id];
            vue['storage' + id].$destroy();
            delete vue['storage' + id];
        });
        
        Object.keys(unwatch).forEach(function (watch) {
            unwatch[watch]();
            delete unwatch[watch];
        });
        
        Object.keys(intervals).forEach(function (interval) {
            clearInterval(intervals[interval]);
            delete intervals[interval];
        });
        
        save.clear();
        window.location.reload();
    });
    
    $('#debug').on('click',function(e){
        e.preventDefault();
        
        if (global['debug']) {
            $('#debug').removeClass('btn-primary');
            $('#debug').addClass('btn-secondary');
            global['debug'] = 0;
        }
        else {
            $('#debug').addClass('btn-primary');
            $('#debug').removeClass('btn-secondary');
            global['debug'] = 1;
        }
    });
} 

Math.rand = function(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

Math.seed = 2;
Math.seededRandom = function(min, max) {
    max = max || 1;
    min = min || 0;
 
    Math.seed = (Math.seed * 9301 + 49297) % 233280;
    var rnd = Math.seed / 233280;
 
    return min + rnd * (max - min);
}

function nameCase(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
