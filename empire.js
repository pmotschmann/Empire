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
    
    //if (!global['expedition']) {
        $('#expedition_button').hide();
    //}
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
    
    $('.c-tab').on('click', function (e) {
        var obj = $(this);
        $('.c-tab').each(function () {
            if (obj.attr('href') === $(this).attr('href')) {
                return;
            }
            if (!$(this).hasClass('collapsed')) {
                $(this).addClass('collapsed');
                var href = $(this).attr('href');
                $(href).removeClass('show');
                $(href).removeClass('active');
            }
        });
    });
    
    // Start game loop
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
            var redraw = false;
            
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
                        if (unwatch[mine['id'] + res]) {
                            unwatch[mine['id'] + res]();
                            delete unwatch[mine['id'] + res];
                        }
                    });
                    if (unwatch[mine['id'] + 'workers']) {
                        unwatch[mine['id'] + 'workers']();
                        delete unwatch[mine['id'] + 'workers'];
                    }
                    delete vue[mine['id'] + 'workers'];
                    delete vue[mine['id']];
                    city[id].map[mine.x][mine.y][mine.z] = [];
                    city[id]['mine'].splice(key, 1);
                    
                    redraw = true;
                }
            }
            
            // Triggers production
            Object.keys(building).forEach(function (bld) {
                // Work
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
                // Training
                if (city[id][bld] && city[id][bld]['training'] && city[id][bld]['training'] > 0) {
                    employed++;
                    var decrement = 1;
                    if (city[id]['university']) {
                        decrement += city[id]['university']['workers'];
                    }
                    city[id][bld]['training'] -= decrement;
                    
                    if (city[id][bld]['training'] <= 0) {
                        $('#' + city[id][bld]['t_type'] + city[id][bld]['t_id'] + 'ProgressBar').css('width', '0%');
                        city[id][bld]['training'] = 0;
                        city[id][bld][city[id][bld]['t_type']]++;
                        $('#' + city[id][bld]['t_type'] + city[id][bld]['t_id']).html(city[id][bld][city[id][bld]['t_type']] + '/' + city[id][bld]['t_cap'] + ' ' + jobs[city[id][bld]['t_job']].title);
                        delete city[id][bld]['training'];
                        delete city[id][bld]['t_type'];
                        delete city[id][bld]['t_id'];
                        delete city[id][bld]['t_cap'];
                        delete city[id][bld]['t_job'];
                    }
                    else {
                        var value = 100 - Math.ceil((city[id][bld]['training'] / jobs[city[id][bld]['t_job']].train) * 100);
                        $('#' + city[id][bld]['t_type'] + city[id][bld]['t_id'] + 'ProgressBar').css('width', value + '%');
                    }
                }
            });
            
            // Updates storage totals
            var storage_cap = 100;
            if (city[id]['shed']) {
                if (global['packing'] >= 1) {
                    storage_cap += (city[id]['shed'].owned * 25);
                }
                else {
                    storage_cap += (city[id]['shed'].owned * 20);
                }
            }
            if (city[id]['warehouse']) {
                if (global['packing'] >= 2) {
                    storage_cap += (city[id]['warehouse'].owned * 125);
                }
                else {
                    storage_cap += (city[id]['warehouse'].owned * 100);
                }
            }
            city[id]['storage_cap'] = storage_cap;
            var storage_sum = Number(Object.keys(city[id]['storage']).length ? Object.values(city[id]['storage']).reduce((a, b) => a + b) : 0);
            $('#cityStorage' + id).html(storage_sum + ' / ' + city[id]['storage_cap']);
            
            if (city[id]['city_hall'] && city[id]['city_hall']['accountant'] > 0) {
                employed++;
                revenue += jobs['accountant']['tax'];
            }
            
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
                    redraw = true;
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
            if (employed > city[id].citizen.amount) {
                city[id].citizen.idle = 0;
                var overstaffed = employed - city[id].citizen.amount;
                Object.keys(city[id]).forEach(function (obj) {
                    if (city[id][obj]['workers'] && city[id][obj].workers > 0 && overstaffed > 0) {
                        overstaffed--;
                        city[id][obj].workers--;
                    }
                    else if (city[id][obj]['foreman'] && city[id][obj].foreman > 0 && overstaffed > 0) {
                        overstaffed--;
                        city[id][obj].foreman--;
                    }
                    else if (city[id][obj]['manager'] && city[id][obj].manager > 0 && overstaffed > 0) {
                        overstaffed--;
                        city[id][obj].manager--;
                    }
                    else if (overstaffed === 0) {
                        return;
                    }
                });
            }
            else {
                city[id].citizen.idle = city[id].citizen.amount - employed;
            }
            
            // Ensure storage is displayed accurately
            var redraw_storage = false;
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
                    redraw_storage = true;
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
            if (redraw_storage) {
                loadCityStorage(id);
            }
            
            if (city[id]['city_hall']['accountant'] && city[id]['city_hall']['accountant'] >= 1) {
                $('#ledger_button').css('display','inline-block');
                $('#city_ledger' + id).empty();
                Object.keys(city[id]).forEach(function (key) {
                    if (key !== 'mine' && building[key]) {
                        var entry = $('<div></div>');
                        var rank = city[id][key].rank;
                        
                        var title = $('<span></span>');
                        var struct = $('<span>' + building[key]['rank'][rank]['name'] + '</span>');
                        title.append(struct);
                        entry.append(title);
                        var count = 0;
                        
                        if (building[key]['type'] === 'storage') {
                            count++;
                            var owned = $('<span>Owned: ' + city[id][key].owned + '</span>');
                            entry.append(owned);
                        }
                        else {
                            var tax_revenue = 0;
                            Object.keys(city[id][key]).forEach(function (prop) {
                                if (prop === 'workers') {
                                    count++;
                                    var workforce = $('<span>' + jobs[building[key]['rank'][rank].labor].title + ': ' + city[id][key][prop] + '/' + building[key]['rank'][rank].labor_cap + '</span>');
                                    entry.append(workforce);
                                    tax_revenue += (jobs[building[key]['rank'][rank].labor].tax * city[id][key][prop]); 
                                }
                                else if (jobs[prop]) {
                                    count++;
                                    var workforce = $('<span>' + jobs[prop].title + ': ' + city[id][key][prop] + '/1</span>');
                                    entry.append(workforce);
                                    tax_revenue += (jobs[prop].tax * city[id][key][prop]);
                                }
                            });
                            if (global['economics'] >= 2) {
                                tax_revenue *= city[id]['tax_rate'];
                                if (global['economics'] >= 4) {
                                    tax_revenue *= 2;
                                }
                                var income_tax = $('<span>Tax: $' + tax_revenue + '/min</span>');
                                title.append(income_tax);
                            }
                        }
                        
                        if (count % 2 === 1) {
                            var padding = $('<span>&nbsp;</span>');
                            entry.append(padding);
                        }
                        
                        $('#city_ledger' + id).append(entry);
                    }
                });
                for (var m=0; m<city[id].mine.length; m++) {
                    var entry = $('<div></div>');
                    city[id].mine[m].name;
                    var rank = city[id].mine[m].rank;
                    
                    var title = $('<span></span>');
                    var mine = $('<span>' + city[id].mine[m].name + '</span>');
                    title.append(mine);
                    entry.append(title);
                    
                    var tax_revenue = 0;
                    var workforce = $('<span>' + jobs[building['mine']['rank'][rank].labor].title + ': ' + city[id].mine[m]['workers'] + '/' + building['mine']['rank'][rank].labor_cap + '</span>');
                    entry.append(workforce);
                    tax_revenue += (jobs[building['mine']['rank'][rank].labor].tax * city[id].mine[m]['workers']); 
                    
                    if (global['overseer'] >= 2) {
                        var manager = $('<span>' + jobs['manager'].title + ': ' + city[id].mine[m]['manager'] + '/1</span>');
                        entry.append(manager);
                        tax_revenue += (jobs['manager'].tax * city[id].mine[m]['manager']); 
                    }
                    else {
                        var padding = $('<span>&nbsp;</span>');
                        entry.append(padding);
                    }
                    
                    var count = 0;
                    Object.keys(city[id].mine[m].resources).forEach(function (mineral) {
                        var res = $('<span>' + nameCase(mineral) + ': ' + city[id].mine[m].resources[mineral] + '</span>');
                        entry.append(res);
                    });
                    if (global['economics'] >= 2) {
                        tax_revenue *= city[id]['tax_rate'];
                        if (global['economics'] >= 4) {
                            tax_revenue *= 2;
                        }
                        var income_tax = $('<span>Tax: $' + tax_revenue + '/min</span>');
                        title.append(income_tax);
                    }
                    
                    if (count % 2 === 1) {
                        var padding = $('<span>&nbsp;</span>');
                        entry.append(padding);
                    }
                    
                    $('#city_ledger' + id).append(entry);
                }
            }
            else {
                $('#ledger_button').css('display','none');
            }
            if (redraw) {
                loadCityMap(id);
            }
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
            if (!city[0]['storage'][cost] || t_cost > city[0].storage[cost]) {
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
