function loadCity() {
    
    var city_data = save.getItem('city') || false;
    if (city_data) {
        // Load preexiting game data
        city = JSON.parse(city_data);
    }
    else {
        // New game, setup starter state
        // Player starts with a starter mine
        city[0]['mine'] = [
            /*{
                id: 'mine0',
                name: 'Basic Mine',
                type: 'mine',
                resources: {
                    stone: 5000,
                    copper: 2500,
                    iron: 1000,
                },
                workers: 0
            }*/
        ];
        
        city[0]['biome'] = 'grassland';
        city[0]['tax_rate'] = 1;
        city[0]['tax_day'] = 60;
        city[0]['storage_cap'] = 100;
        city[0]['storage'] = { lumber: 0, stone: 0 };
        city[0]['citizen'] = {
            amount: 0,
            idle: 0,
            max: 0
        };
    }
    
    for (var i=0; i < city.length; i++) {
        var storages = $('<div id="storage' + i + '" class="storages d-flex"></div>');
        $('#storage_pane').append(storages);
        var structures = $('<div id="structures' + i + '" class="structures d-flex"></div>');
        $('#structures_pane').append(structures);
        var blueprints = $('<div id="blueprints' + i + '" class="blueprints d-flex"></div>');
        $('#blueprints_pane').append(blueprints);
        var mines = $('<div id="mines' + i + '" class="mines d-flex"></div>');
        $('#mines_pane').append(mines);
        loadCityStorage(i);
        loadCityCore(i);
        loadMines(i);
        loadInfoBar(i);
    }
}

function loadCityStorage(id) {
    vue['storage' + id] = new Vue({
        data: { store: city[id]['storage'] }
    });
    unwatch[id] = {};
    Object.keys(city[id]['storage']).forEach(function (res) {
        drawCityStorage(id,res);
    });
}

function drawCityStorage(id,res) {
    var container = $('<div class="row ' + res + '"></div>');
    var popover_content = '<a id="destroy' + id + res + '">Destroy ' + nameCase(res) + '</a>';
    var resource = $('<div class="col"></div>');
    var resource = $('<div class="col"><a id="pop' + id + res + '" tabindex="0" href="#" role="button" data-trigger="manual" data-toggle="popover">' + nameCase(res) + '</a></div>');
    var amount = $('<div class="col">' + city[id]['storage'][res] + '</div>');
    container.append(resource);
    container.append(amount);
    
    if (global['resource'][res] && global['resource'][res].manual && global['resource'][res].unlocked && id === 0) {
        var row2 = $('<div class="row"></div>');
        var clicker = $('<div class="progress col"></div>');
        var harvest = $('<div class="progress-bar-title">Gather</div>');
        var progress = $('<div id="' + res + 'ProgressBar" class="progress-bar progress-bar-striped bg-success" style="width:0%" role="progress-bar"></div>');
        clicker.append(progress);
        clicker.append(harvest);
        row2.append(clicker);
        
        var outer = $('<div class="row"></div>');
        var inner = $('<div class="container"></div>');
        inner.append(container);
        inner.append(row2);
        outer.append(inner);
        $('#storage' + id).append(outer);
        
        clicker.on('click',function(e){
            e.preventDefault();
            var bar = $('#' + res + 'ProgressBar');
            if (parseInt(bar.width()) > 0) {
                return false;
            }
            var width = 1;
            var refreshId = setInterval(function() {
                if (width >= 100) {
                    clearInterval(refreshId);
                    var yield = global['resource'][res]['yield'];
                    var storage_sum = Number(Object.keys(city[id]['storage']).length ? Object.values(city[id]['storage']).reduce((a, b) => a + b) : 0);
                    if (yield + storage_sum > city[0].storage_cap) {
                        yield = city[0].storage_cap - storage_sum;
                    }
                    city[0]['storage'][res] += yield;
                    storage_sum += yield;
                    $('#cityStorage' + id).html(storage_sum + ' / ' + city[id]['storage_cap']);
                    bar.width('0');
                } else {
                    width++; 
                    bar.width(width + '%');
                }
            }, gatherRateTable[global['resource'][res]['rate']]);
            
            return false;
        });
    }
    else {
        $('#storage' + id).append(container);
    }
    
    $('#pop' + id + res).popover({
        html: true,
        placement: 'top',
        content: function() {
            if (city[id]['trading_post']) {
                return $('<a href="#">Sell $' + global['resource'][res]['value'] + '/each</a>').on('click',function(e){
                    if (city[id]['storage'][res] > 0) {
                        city[id]['storage'][res]--;
                        global['money'] += global['resource'][res]['value'];
                    }
                });
            }
            else {
                return $('<a href="#">Destroy</a>').on('click',function(e){
                    if (city[id]['storage'][res] > 0) {
                        city[id]['storage'][res]--;
                    }
                });
            }
        }
    });
    
    $('#pop' + id + res).click(function() {
        $(this).popover('toggle');
    });
    
    unwatch[id]['storage' + res] = vue['storage' + id].$watch('store.'+res, function (newValue, oldValue) {
        amount.html(newValue);
    });
}

function loadInfoBar(id) {
    var container = $('<div id="info' + id + '" class="row"></div>');
    var money = $('<div class="money col-2">$' + Number(save.getItem('money')) + '</div>');
    container.append(money);
    
    var current = $('<div class="citizen col-3">Citizens: <span id="citizens' + id + '">' + city[id]['citizen']['amount'] + ' / ' + city[id]['citizen']['max'] + '</span></div>');
    var idle = $('<div class="citizen col-3">Idle: <span id="idleCitizens' + id + '">' + city[id]['citizen']['idle'] + '</span></div>');
    
    container.append(current);
    container.append(idle);
    
    var storage_sum = Number(Object.keys(city[id]['storage']).length ? Object.values(city[id]['storage']).reduce((a, b) => a + b) : 0);
    var store = $('<div class="store col">Storage <span id="cityStorage' + id + '">' + storage_sum + ' / ' + city[id]['storage_cap'] + '</span></div>');
    container.append(store);
    
    $('#city_info').append(container);
    
    var vm_cash = new Vue({
        data: global
    });
    vm_cash.$watch('money', function (newValue, oldValue) {
        money.html('$' + newValue);
    });
    
    var vm = new Vue({
        data: city[id]['citizen']
    });
    vm.$watch('amount', function (newValue, oldValue) {
        var dif = newValue - oldValue;
        city[id]['citizen']['idle'] += dif;
        $('#citizens' + id).html(city[id]['citizen']['amount'] + ' / ' + city[id]['citizen']['max']);
    });
    vm.$watch('idle', function (newValue, oldValue) {
        $('#idleCitizens' + id).html(city[id]['citizen']['idle']);
    });
    vm.$watch('max', function (newValue, oldValue) {
        $('#citizens' + id).html(city[id]['citizen']['amount'] + ' / ' + city[id]['citizen']['max']);
    });
    
    // for testing reasons
    //city[id]['citizen']['max'] = 5;
}

// Loads all core city elements
function loadCityCore(id) {
    $('#structures'+id).empty();
    $('#blueprints'+id).empty();
    
    Object.keys(building).forEach(function (key) {
        switch (building[key]['type']) {
            case 'mine':
                // Mines are handled elsewhere, do nothing
                break;
            case 'factory':
                // Load factory type buildings
                loadFactory(id,key);
                break;
            case 'storage':
                // Load storage type buildings
                loadStorage(id,key);
                break;
            case 'unique':
                // Load unique type buildings
                loadUnique(id,key);
                break;
            default:
                // Building type was not recognized, ignore it
                break;
        }
    });
}

// Adds factory type building to city
function loadFactory(id,factory) {
    if (city[id][factory]) {
        // Player has this building
        var rank = city[id][factory]['rank'];
        
        var structure = $('<div id="' + factory + id + '" class="city factory"></div>');
        var header = $('<div class="header row"><div class="col">' + building[factory]['rank'][rank]['name'] +'</div></div>');
        var workers = $('<div class="col"></div>');
        var remove = $('<span id="' + factory + id + 'RemoveWorker" class="remove">&laquo;</span>');
        var add = $('<span id="' + factory + id + 'AddWorker" class="add">&raquo;</span>');
        var count = $('<span id="' + factory + id + 'Workers" class="workers">' + city[id][factory]['workers'] + ' Mill Workers</span>');
        
        workers.append(remove);
        workers.append(count);
        workers.append(add);
        structure.append(header);
        structure.append(workers);
        
        $('#structures' + id).append(structure);
        
        $('#' + factory + id + 'RemoveWorker').on('click',function(e){
            e.preventDefault();
            
            if (Number(city[id][factory]['workers']) > 0) {
                city[id][factory]['workers']--;
                city[id]['citizen']['idle']++;
                count.html(city[id][factory]['workers'] + ' Mill Workers');
            }
        });
        
        $('#' + factory + id + 'AddWorker').on('click',function(e){
            e.preventDefault();
            
            if (Number(city[id]['citizen']['idle']) > 0) {
                city[id][factory]['workers']++;
                city[id]['citizen']['idle']--;
                count.html(city[id][factory]['workers'] + ' Mill Workers');
            }
        });
    }
    else {
        // Player does not have this building
        if (checkRequirements(building[factory]['rank'][0].require)) {
            var structure = $('<div id="' + factory + id + '" class="city blueprint"></div>');
            var header = $('<div class="header row"><div class="col build">Construct ' + building[factory]['rank'][0]['name'] +'</div></div>');
            structure.append(header);
            
            Object.keys(building[factory]['rank'][0]['cost']).forEach(function (cost) { 
                var res = $('<span class="resource col">' + nameCase(cost) + '</span>');
                var price = $('<span class="cost col">' + building[factory]['rank'][0]['cost'][cost] + '</span>');
                var row = $('<div class="row"></div>');
                row.append(res);
                row.append(price);
                structure.append(row);
            });
            
            $('#blueprints' + id).append(structure);
            
            header.on('click',function(e){
                e.preventDefault();
                
                var paid = true;
                Object.keys(building[factory]['rank'][0]['cost']).forEach(function (cost) {
                    if (city[id]['storage'][cost] < building[factory]['rank'][0]['cost'][cost]) {
                        paid = false;
                        return;
                    }
                });
                if (paid) {
                    Object.keys(building[factory]['rank'][0]['cost']).forEach(function (cost) {
                        city[id]['storage'][cost] -= building[factory]['rank'][0]['cost'][cost];
                    });
                    city[id][factory] = {
                        rank: 0,
                        workers: 0
                    };
                    loadCityCore(id);
                }
            });
        }
    }
}

// Adds storage type building to city
function loadStorage(id,storage) {
    
    // Find newest plans
    var rank = -1;
    for (var i=0; i < building[storage]['rank'].length; i++) {
        if (checkRequirements(building[storage]['rank'][i].require)) {
            rank = i;
        }
        else {
            break;
        }
    }
    
    // Blueprint available
    if (rank > -1) {
        var structure = $('<div id="' + storage + id + '" class="city blueprint"></div>');
        var header = $('<div class="header row"><div class="col build">Construct ' + building[storage]['rank'][rank]['name'] + '</div></div>');
        structure.append(header);
        
        Object.keys(building[storage]['rank'][rank]['cost']).forEach(function (cost) { 
            var res = $('<span class="resource col">' + nameCase(cost) + '</span>');
            var price = $('<span class="cost col">' + building[storage]['rank'][rank]['cost'][cost] + '</span>');
            var row = $('<div class="row"></div>');
            row.append(res);
            row.append(price);
            structure.append(row);
        });
        
        $('#blueprints' + id).append(structure);
        
        header.on('click',function(e){
            e.preventDefault();
            
            var paid = true;
            Object.keys(building[storage]['rank'][rank]['cost']).forEach(function (cost) {
                if (city[id]['storage'][cost] < building[storage]['rank'][0]['cost'][cost]) {
                    paid = false;
                    return;
                }
            });
            if (paid) {
                Object.keys(building[storage]['rank'][rank]['cost']).forEach(function (cost) {
                    city[id]['storage'][cost] -= building[storage]['rank'][0]['cost'][cost];
                });
                var owned = 0;
                if (city[id][storage]) {
                    owned = city[id][storage]['owned'];
                }
                city[id][storage] = {
                    owned: owned + 1,
                    rank: rank
                };
                loadCityCore(id);
            }
        });
    }
    
    // Player has at least one of this building
    if (city[id][storage]) {
        var structure = $('<div id="' + storage + id + 'bp" class="city blueprint"></div>');
        var header = $('<div class="header row"><div class="col build">' + building[storage]['rank'][rank]['name'] + '</div></div>');
        structure.append(header);
        
        var owned = $('<div class="col">Constructed: ' + city[id][storage]['owned'] + '</div>');
        structure.append(owned);
    }
}

// Adds unique type building to city
function loadUnique(id,unique) {
    if (city[id][unique]) {
        // Player has this building
    }
    else {
        // Player does not have this building
    }
}

// Reloads all mines into UI
function loadMines(id) {
    $('#mines' + id).empty();
    
    Object.keys(city[id]['mine']).forEach(function (key) {
        registerMine(id,city[id]['mine'][key]);
    });
}

// Adds an individual mine to the UI
function registerMine(id,mine) {
    var container = $('<div id="' + mine['id'] + '" class="city mine"></div>');
    
    var header = $('<div class="header row"><div class="col">' + mine['name'] +'</div></div>');
    var workers = $('<div class="col"></div>');
    var remove = $('<span id="' + mine['id'] + 'RemoveWorker" class="remove">&laquo;</span>');
    var add = $('<span id="' + mine['id'] + 'AddWorker" class="add">&raquo;</span>');
    var count = $('<span id="' + mine['id'] + 'Workers" class="workers">' + mine['workers'] + ' Miners</span>');
    
    workers.append(remove);
    workers.append(count);
    workers.append(add);
    header.append(workers);
    container.append(header);
    
    $('#mines' + id).append(container);
    
    $('#' + mine['id'] + 'RemoveWorker').on('click',function(e){
        e.preventDefault();
        
        if (Number(mine['workers']) > 0) {
            mine['workers']--;
            city[id]['citizen']['idle']++;
        }
    });
    
    $('#' + mine['id'] + 'AddWorker').on('click',function(e){
        e.preventDefault();
        
        if (Number(city[id]['citizen']['idle']) > 0) {
            mine['workers']++;
            city[id]['citizen']['idle']--;
        }
    });
    
    var vm_w = new Vue({
        data: mine
    });
    
    unwatch[mine['id'] + 'workers'] = vm_w.$watch('workers', function (newValue, oldValue) {
        count.html(newValue + ' Miners');
    });
    
    var vm_r = new Vue({
        data: mine['resources']
    });
    
    var minerals = $('<div></div>');
    Object.keys(mine['resources']).forEach(function (mineral) {
        var row = $('<div class="row"></div>');
        var type = $('<span class="col">' + nameCase(mineral) + ' </span>');
        var remain = $('<span class="col" id="' + mine['id'] + mineral + '">' + mine['resources'][mineral] + '</span>');
        row.append(type);
        row.append(remain);
        
        unwatch[mine['id'] + mineral] = vm_r.$watch(mineral, function (newValue, oldValue) {
            remain.html(newValue);
        });
        
        container.append(row);
    });
}
