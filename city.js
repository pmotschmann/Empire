function loadCity() {
    
    var city_data = save.getItem('city') || false;
    if (city_data) {
        // Load preexiting game data
        city = JSON.parse(city_data);
    }
    else {
        // New game, setup starter state
        // Player starts with a starter mine
        city[0]['id'] = 0;
        city[0]['mine'] = [];
        city[0]['biome'] = 'capital';
        city[0]['tax_rate'] = 1;
        city[0]['timer'] = 60;
        city[0]['storage_cap'] = 100;
        city[0]['prospecting'] = false;
        city[0]['storage'] = { lumber: 0, stone: 0 };
        city[0]['map'] = generateMap('capital',10);
        city[0]['size'] = 2;
        city[0]['scale'] = 50;
        city[0]['quota'] = {};
        city[0]['citizen'] = {
            amount: 0,
            idle: 0,
            max: 0
        };
        city[0]['city_hall'] = {
            rank: 0
        };
    }
    city[0]['biome'] = 'capital';
    
    if (!city[0]['map']) {
        upgrade_save();
    }
    
    if (!city[0]['prospecting_offer']) {
        city[0]['prospecting_offer'] = {};
    }
    
    if (!global.resource.cement.unlocked && city[0]['cement_plant']) {
        global.resource.cement.unlocked = 1;
    }
    
    for (var i=0; i < city.length; i++) {
        var storages = $('<div id="storage' + i + '" class="storages d-flex"></div>');
        $('#storage_pane').append(storages);
        var map = $('<div id="city_map' + i + '" class="map d-flex"></div>');
        $('#map_pane').append(map);
    
        loadCityStorage(i);
        loadInfoBar(i);
        loadCityMap(i);
        loadCityLedger(i);
    }
}

function tileInfo(town, x, y, z) {
    if (town.map[x][y][z][0]) {
        switch (town.map[x][y][z][0].type) {
            case 'debris':
                unoccupiedSpace(town, x, y, z);
                break;
            case 'mine':
                 // place holder
                for (var i=0; i<town.mine.length; i++) {
                    if (town.mine[i].id === town.map[x][y][z][0].id) {
                        var mine = town.mine[i];
                        $('#modalTitle').html(mine.name);
                        $('#modalContent').empty();
                        loadMineOptions(town, mine, x, y, z);
                        break;
                    } 
                }
                break;
            default:
                var rank = town[town.map[x][y][z][0].type].rank;
                $('#modalTitle').html(building[town.map[x][y][z][0].type].rank[rank].name);
                $('#modalContent').empty();
                loadBuildingOptions(town, x, y, z, town.map[x][y][z][0].type, rank);
                break;
        }
    }
    else {
        unoccupiedSpace(town, x, y, z);
    }
    $('#modal').modal();
}

function unoccupiedSpace(town, x, y, z) {
    var name = town.biome;
    if (biomes[name]['name']) {
        name = biomes[name]['name']
    }
    
    $('#modalTitle').html(nameCase(name));
    $('#modalContent').empty();
    
    if (isDeveloped(town.map, x+1, y-1, z) || isDeveloped(town.map, x-1, y+1, z) || isDeveloped(town.map, x+1, y, z-1) || isDeveloped(town.map, x-1, y, z+1) || isDeveloped(town.map, x, y+1, z-1) || isDeveloped(town.map, x, y-1, z+1)) {
        loadBlueprints(town, x, y, z);
    }
    else {
        var wilds = $('<div>Wild ' + name + ' too far from your settlement to develop.</div>');
        $('#modalContent').append(wilds);
    }
}

function isDeveloped(map, x, y, z) {
    if (map[x] && map[x][y] && map[x][y][z]) {
        if (map[x][y][z].length > 0 && map[x][y][z][0].type !== 'debris') {
            return true;
        }
    }
    return false;
}

function loadBuildingOptions(town, x, y, z, type, rank) {
    $('#modalContent').html(building[type].rank[rank].description);
    switch(building[type].type) {
        case 'unique':
            loadUniqueBuilding(town, x, y, z, type, rank);
            break;
        case 'factory':
            loadFactoryBuilding(town, x, y, z, type, rank);
            break;
        case 'storage':
            loadStorageBuilding(town, x, y, z, type, rank);
            break;
        default:
            break;
    }
}

function loadUniqueBuilding(town, x, y, z, type, rank) {
    
    var title = building[type]['rank'][rank]['description'];
    var structure = $('<div class="city unique" title="' + title + '"></div>');
    
    if (building[type]['rank'][rank]['staff']) {
        var workers = $('<div class="col"></div>');
        var remove = $('<span class="remove">&laquo;</span>');
        var add = $('<span class="add">&raquo;</span>');
        workers.append(remove);
        
        var count;
        if (jobs[building[type]['rank'][rank]['labor']].skilled) {
            var worker = $('<div class="progress labor"></div>');
            var progress = $('<div id="workers' + String(x)+String(y)+String(z) + 'ProgressBar" class="progress-bar progress-bar-striped bg-success" style="width:0%" role="progress-bar"></div>');
            count = $('<div id="workers' + String(x)+String(y)+String(z) + '" class="progress-bar-title workers" title="' + jobTitle(town,building[type]['rank'][rank]['labor']) + '">' + town[type]['workers'] + '/' + building[type]['rank'][rank]['labor_cap'] + ' ' + jobs[building[type]['rank'][rank]['labor']]['title'] + '</div>');
            worker.append(progress);
            worker.append(count);
            workers.append(worker);
        }
        else {
            count = $('<span id="workers' + String(x)+String(y)+String(z) + '" class="workers" title="' + jobTitle(town,building[type]['rank'][rank]['labor']) + '">' + town[type]['workers'] + '/' + building[type]['rank'][rank]['labor_cap'] + ' ' + jobs[building[type]['rank'][rank]['labor']]['title'] + '</span>');
            workers.append(count);
        }
        
        workers.append(add);
        structure.append(workers);
        
        $('#modalContent').append(structure);
        
        remove.on('click',function(e){
            e.preventDefault();
            
            if (Number(town[type]['workers']) > 0) {
                town[type]['workers']--;
                town['citizen']['idle']++;
                count.html(town[type]['workers'] + '/' + building[type]['rank'][rank]['labor_cap'] + ' ' + jobs[building[type]['rank'][rank]['labor']]['title']);
            }
        });
        
        add.on('click',function(e){
            e.preventDefault();
            
            if (Number(town['citizen']['idle']) > 0 && town[type]['workers'] < building[type]['rank'][rank]['labor_cap']) {
                if (jobs[building[type]['rank'][rank]['labor']].skilled) {
                    if (town[type]['training']) { } 
                    else {
                        town[type]['training'] = jobs[building[type]['rank'][rank]['labor']].train;
                        town[type]['t_type'] = 'workers';
                        town[type]['t_job'] = building[type]['rank'][rank]['labor'];
                        town[type]['t_id'] = String(x)+String(y)+String(z);
                        town[type]['t_cap'] = building[type]['rank'][rank]['labor_cap'];
                        town['citizen']['idle']--;
                    }
                }
                else {
                    town[type]['workers']++;
                    town['citizen']['idle']--;
                    count.html(town[type]['workers'] + '/' + building[type]['rank'][rank]['labor_cap'] + ' ' + jobs[building[type]['rank'][rank]['labor']]['title']);
                }
            }
        });
    }
    else {
        $('#modalContent').append(structure);
    }
    
    switch (type) {
        case 'city_hall': // Extra city hall options
            if (global['economics'] >= 5 && town['city_hall'].rank >= 1) {
                if (!town['city_hall']['accountant']) {
                    town['city_hall']['accountant'] = 0;
                }
                var accountant = $('<div class="col"></div>');
                var accountant_remove = $('<span class="remove">&laquo;</span>');
                var accountant_add = $('<span class="add">&raquo;</span>');
                
                accountant.append(accountant_remove);
                
                var accountant_worker = $('<div class="progress labor"></div>');
                var accountant_progress = $('<div id="accountant' + String(x)+String(y)+String(z) + 'ProgressBar" class="progress-bar progress-bar-striped bg-success" style="width:0%" role="progress-bar"></div>');
                var accountant_count = $('<div id="accountant' + String(x)+String(y)+String(z) + '" class="progress-bar-title workers" title="' + jobTitle(town,'accountant') + '">' + town[type]['accountant'] + '/1 ' + jobs['accountant']['title'] + '</div>');
                accountant_worker.append(accountant_progress);
                accountant_worker.append(accountant_count);
                accountant.append(accountant_worker);
                
                accountant.append(accountant_add);
                structure.append(accountant);
                
                accountant_remove.on('click',function(e){
                    e.preventDefault();
                    
                    if (Number(town[type]['accountant']) > 0) {
                        town[type]['accountant'] = 0;
                        town['citizen']['idle']++;
                        accountant_count.html(town[type]['accountant'] + '/1 ' + jobs['accountant']['title']);
                    }
                });
                
                accountant_add.on('click',function(e){
                    e.preventDefault();
                    
                    if (Number(town['citizen']['idle']) > 0 && town[type]['accountant'] < 1) {
                        if (town[type]['training']) { } 
                        else {
                            town[type]['training'] = jobs['accountant'].train;
                            town[type]['t_type'] = 'accountant';
                            town[type]['t_job'] = 'accountant';
                            town[type]['t_id'] = String(x)+String(y)+String(z);
                            town[type]['t_cap'] = 1;
                            town['citizen']['idle']--;
                        }
                    }
                });
            }
            
            // Taxes
            if (global['government'] >= 2 && town['city_hall'].rank >= 1) {
                var rate_table = {
                    1: 'Low Taxes',
                    2: 'Medium Taxes',
                    3: 'High Taxes',
                    4: 'Oppressive Taxes'
                };
                
                var taxes = $('<div class="col"></div>');
                var lower = $('<span class="remove">&laquo;</span>');
                var raise = $('<span class="add">&raquo;</span>');
                var current = $('<span class="workers" title="Set current tax rate, higher taxes may cause discontent">' + rate_table[town['tax_rate']] + '</span>');
                
                taxes.append(lower);
                taxes.append(current);
                taxes.append(raise);
                structure.append(taxes);
                
                lower.on('click',function(e){
                    e.preventDefault();
                    
                    if (town['tax_rate'] > 1) {
                        town['tax_rate']--;
                        current.html(rate_table[town['tax_rate']]);
                    }
                });
                
                raise.on('click',function(e){
                    e.preventDefault();
                    
                    if (town['tax_rate'] < 3 || (global['government'] >= 3 && town['tax_rate'] < 4)) {
                        town['tax_rate']++;
                        current.html(rate_table[town['tax_rate']]);
                    }
                });
            }
            
            // Production Quotas
            if (global['economics'] >= 3 && town['city_hall'].rank >= 1) {
                var quota_row = $('<div class="row"></div>');
                var quota_col = $('<div class="col"></div>');
                var quota = $('<button title="Opens menu to set production quotas">Set Quotas</button>');
                quota_row.append(quota_col);
                quota_col.append(quota);
                structure.append(quota_row);
                
                quota.on('click',function(e){
                    e.preventDefault();
                    
                    var quota_container = $('#city_hall div').first();
                    quota_container.empty();
                    
                    Object.keys(global['resource']).forEach(function (res) {
                        if (global['resource'][res].unlocked){
                            var contain = $('<div class="container"></div>');
                            var div_row = $('<div class="row"><div class="col">' + nameCase(res) + ' Limit </div></div>');
                            var current_quota = town.storage_cap;
                            if (town['quota'][res]) {
                                current_quota = town['quota'][res];
                            }
                            var limit = $('<div class="col">' + current_quota + '</div>');
                            div_row.append(limit);
                            contain.append(div_row);
                            var input = $('<input id="quota' + res + '" type="text" data-slider-id="quota' + res + 'slider" data-provide="slider" data-slider-min="0" data-slider-max="' + town.storage_cap + '" data-slider-step="10" data-slider-value="' + current_quota + '">');
                            contain.append(input);
                            quota_container.append(contain);
                            input.slider({
                                formatter: function(value) {
                                    limit.html(value);
                                    town['quota'][res] = value;
                                    return 'Current value: ' + value;
                                },
                                tooltip: 'show'
                            });
                        }
                    });
                    
                    $('#city_hall').addClass('show');
                    $('#city_hall').addClass('active');
                    
                    $('#city').removeClass('show');
                    $('#city').removeClass('active');
                    
                    $('#menu li a').removeClass('active');
                    $('#modal').modal('toggle');
                });
            }
            break;
        default:
            // Do nothing
            break;
    }
    
    // Upgrade Available
    if (building[type]['rank'][rank + 1] && checkRequirements(building[type]['rank'][rank + 1].require)) {
        var title = building[type]['rank'][rank + 1]['description'];
        var blueprint = $('<div class="city blueprint" title="' + title + '"></div>');
        var header = $('<div class="header row"><div class="col">Upgrade to ' + building[type]['rank'][rank + 1]['name'] +'</div></div>');
        blueprint.append(header);
        
        Object.keys(building[type]['rank'][rank + 1]['cost']).forEach(function (cost) { 
            var row = $('<div class="row"></div>');
            var afford = '';
            if (cost === 'money') {
                var t_cost = inflation(town,type,building[type]['rank'][rank + 1]['cost'][cost]);
                if (t_cost > global.money) {
                    afford = ' unaffordable';
                }
                var price = $('<span class="cost col' + afford + '" data-' + cost + '="' + t_cost + '">$' + t_cost + '</span>');
                row.append(price);
            }
            else {
                var res = $('<span class="resource col">' + nameCase(cost) + '</span>');
                var t_cost = inflation(town,type,building[type]['rank'][rank + 1]['cost'][cost]);
                if (!town['storage'][cost] || t_cost > town['storage'][cost]) {
                    afford = ' unaffordable';
                }
                var price = $('<span class="cost col' + afford + '" data-' + cost + '="' + t_cost + '">' + t_cost + '</span>');
                row.append(res);
                row.append(price);
            }
            blueprint.append(row);
        });
        
        structure.append(blueprint);
        
        blueprint.on('click',function(e){
            e.preventDefault();
            
            var paid = payBuildingCosts(town,type,rank + 1);
            if (paid) {
                town[type].rank++;
                town.map[x][y][z][0].svg = building[type]['rank'][rank + 1].svg;
                if (building[type]['rank'][rank + 1]['staff'] && !town[type]['workers']) {
                    town[type]['workers'] = 0;
                }
                if (building[type]['rank'][rank + 1].effect) {
                    building[type]['rank'][rank + 1].effect(town,type);
                }
                loadCityMap(town.id);
                tileInfo(town, x, y, z);
            }
        });
    }
}

function loadFactoryBuilding(town, x, y, z, type, rank) {
    if (!town[type]['manager']) {
        town[type]['manager'] = 0;
    }
    
    var rank = town[type]['rank'];
    var title = building[type]['rank'][rank]['description'];
    
    var structure = $('<div id="' + type + '" class="city factory" title="' + title + '"></div>');
    var workers = $('<div class="col"></div>');
    var remove = $('<span id="' + type + 'RemoveWorker" class="remove">&laquo;</span>');
    var add = $('<span id="' + type + 'AddWorker" class="add">&raquo;</span>');
    var count = $('<span id="' + type + 'Workers" class="workers" title="' + jobTitle(town,building[type]['rank'][rank]['labor']) + '">' + town[type]['workers'] + '/' + building[type]['rank'][rank]['labor_cap'] + ' ' + jobs[building[type]['rank'][rank]['labor']].title + '</span>');
    
    var count_manager;
    if (global['overseer'] >= 2 && building[type]['rank'][rank]['manager']) {
        var manager = $('<div class="col"></div>');
        var remove_manager = $('<span id="' + type + 'RemoveManager" class="remove">&laquo;</span>');
        var add_manager = $('<span id="' + type + 'AddManager" class="add">&raquo;</span>');
        count_manager = $('<span id="' + type + 'Manager" class="workers" title="' + jobTitle(town,'manager') + '">' + town[type]['manager'] + '/1 ' + jobs['manager']['title'] + '</span>');
        
        manager.append(remove_manager);
        manager.append(count_manager);
        manager.append(add_manager);
        structure.append(manager);
    }
    
    var count_foreman;
    if (global['overseer'] && building[type]['rank'][rank]['foreman']) {
        var foreman = $('<div class="col"></div>');
        var remove_foreman = $('<span id="' + type + 'RemoveForeman" class="remove">&laquo;</span>');
        var add_foreman = $('<span id="' + type + 'AddForeman" class="add">&raquo;</span>');
        count_foreman = $('<span id="' + type + 'Foreman" class="workers" title="' + jobTitle(town,'foreman') + '">' + town[type]['foreman'] + '/1 ' + jobs['foreman']['title'] + '</span>');
        
        foreman.append(remove_foreman);
        foreman.append(count_foreman);
        foreman.append(add_foreman);
        structure.append(foreman);
    }
    
    workers.append(remove);
    workers.append(count);
    workers.append(add);
    structure.append(workers);
    
    $('#modalContent').append(structure);
    
    if (global['overseer'] && building[type]['rank'][rank]['foreman']) {
        $('#' + type + 'RemoveForeman').on('click',function(e){
            e.preventDefault();
            
            if (Number(town[type]['foreman']) > 0) {
                town[type]['foreman']--;
                town['citizen']['idle']++;
                count_foreman.html(town[type]['foreman'] + '/1 ' + jobs['foreman']['title']);
            }
        });
        
        $('#' + type + 'AddForeman').on('click',function(e){
            e.preventDefault();
            
            if (Number(town['citizen']['idle']) > 0 && town[type]['foreman'] < 1) {
                town[type]['foreman']++;
                town['citizen']['idle']--;
                count_foreman.html(town[type]['foreman'] + '/1 ' + jobs['foreman']['title']);
            }
        });
    }
    
    if (global['overseer'] >= 2 && building[type]['rank'][rank]['manager']) {
        $('#' + type + 'RemoveManager').on('click',function(e){
            e.preventDefault();
            
            if (Number(town[type]['manager']) > 0) {
                town[type]['manager']--;
                town['citizen']['idle']++;
                count_manager.html(town[type]['manager'] + '/1 ' + jobs['manager']['title']);
            }
        });
        
        $('#' + type + 'AddManager').on('click',function(e){
            e.preventDefault();
            
            if (Number(town['citizen']['idle']) > 0 && town[type]['manager'] < 1) {
                town[type]['manager']++;
                town['citizen']['idle']--;
                count_manager.html(town[type]['manager'] + '/1 ' + jobs['manager']['title']);
            }
        });
    }
    
    $('#' + type + 'RemoveWorker').on('click',function(e){
        e.preventDefault();
        
        if (Number(town[type]['workers']) > 0) {
            town[type]['workers']--;
            town['citizen']['idle']++;
            count.html(town[type]['workers'] + '/' + building[type]['rank'][rank]['labor_cap'] + ' ' + jobs[building[type]['rank'][rank]['labor']]['title']);
        }
    });
    
    $('#' + type + 'AddWorker').on('click',function(e){
        e.preventDefault();
        
        if (Number(town['citizen']['idle']) > 0 && town[type]['workers'] < building[type]['rank'][rank]['labor_cap']) {
            town[type]['workers']++;
            town['citizen']['idle']--;
            count.html(town[type]['workers'] + '/' + building[type]['rank'][rank]['labor_cap'] + ' ' + jobs[building[type]['rank'][rank]['labor']]['title']);
        }
    });
}

function loadStorageBuilding(town, x, y, z, type, rank) {
    var container = $('<div class="d-flex city"></div>');
    $('#modalContent').append(container);
    if ((building[type].rank[rank]['tile_limit'] && town.map[x][y][z].length < building[type].rank[rank]['tile_limit']) || !building[type].rank[rank]['tile_limit']) {
        showBlueprint(container, town, type, rank, false, x, y, z, offsets(town, type, rank, town.map[x][y][z].length));
    }
}

function loadBlueprints(town, x, y, z) {
    var flex = $('<div class="city"></div>');
    var container = $('<div class="blueprints d-flex"></div>');
    flex.append(container);
    $('#modalContent').append(flex);
    
    Object.keys(building).forEach(function (key) {
        if (building[key]['allow'].all || building[key]['allow'][town.biome]) {
            switch (building[key]['type']) {
                case 'mine':
                    // Load Prospecting Option
                    if (global['survey']) {
                        loadProspect(container,town.id, x, y, z);
                    }
                    break;
                case 'factory':
                    // Load factory type buildings
                    if (!town[key]) {
                        showBlueprint(container, town, key, 0, true, x, y, z, offsets(town, key, rank, 0));
                    }
                    break;
                case 'storage':
                    // Load storage type buildings
                    var rank = -1;
                    for (var i=0; i < building[key]['rank'].length; i++) {
                        if (checkRequirements(building[key]['rank'][i].require)) {
                            rank = i;
                        }
                        else {
                            break;
                        }
                    }
                    if (rank > -1) {
                        showBlueprint(container, town, key, rank, true, x, y, z, offsets(town, key, rank, 0));
                    }
                    break;
                case 'unique':
                    // Load unique type buildings
                    if (!town[key]) {
                        showBlueprint(container, town, key, 0, true, x, y, z, offsets(town, key, rank, 0));
                    }
                    break;
                default:
                    // Building type was not recognized, ignore it
                    break;
            }
        }
    });
}

function showBlueprint(container, town, type, rank, clear, x, y, z, offsets) {
    // Building Available
    if (building[type]['rank'][rank] && checkRequirements(building[type]['rank'][rank].require)) {
        
        // Limit detection
        var buildable = true;
        if (building[type]['rank'][rank]['limit']) {
            var owned = 0;
            if ( town[type] ) {
                owned = town[type]['owned'];
            }
            if (building[type]['rank'][rank]['limit'] <= owned) {
                buildable = false;
            }
        }
        
        if (buildable) {
            var title = building[type]['rank'][rank]['description'];
            var blueprint = $('<div class="city blueprint" title="' + title + '"></div>');
            var header = $('<div class="header row"><div class="col">Construct ' + building[type]['rank'][rank]['name'] +'</div></div>');
            blueprint.append(header);
            
            Object.keys(building[type]['rank'][rank]['cost']).forEach(function (cost) { 
                var row = $('<div class="row"></div>');
                var afford = '';
                if (cost === 'money') {
                    var t_cost = inflation(town,type,building[type]['rank'][rank]['cost'][cost]);
                    if (t_cost > global.money) {
                        afford = ' unaffordable';
                    }
                    var price = $('<span class="cost col' + afford + '" data-' + cost + '="' + t_cost + '">$' + t_cost + '</span>');
                    row.append(price);
                }
                else {
                    var res = $('<span class="resource col">' + nameCase(cost) + '</span>');
                    var t_cost = inflation(town,type,building[type]['rank'][rank]['cost'][cost]);
                    if (!town['storage'][cost] || t_cost > town['storage'][cost]) {
                        afford = ' unaffordable';
                    }
                    var price = $('<span class="cost col' + afford + '" data-' + cost + '="' + t_cost + '">' + t_cost + '</span>');
                    row.append(res);
                    row.append(price);
                }
                blueprint.append(row);
            });
            
            container.append(blueprint);
            
            blueprint.on('click',function(e){
                e.preventDefault();
                
                var paid = payBuildingCosts(town,type,rank);
                if (paid) {
                    var struct = {  
                        type: type,
                        svg: building[type].rank[rank].svg,
                        x: offsets.x,
                        y: offsets.y
                    };
                    if (clear) {
                        town.map[x][y][z] = [struct];
                    }
                    else {
                        town.map[x][y][z].push(struct);
                    }
                    if (town[type]) {
                        town[type].rank = rank;
                        town[type].owned++;
                    }
                    else {
                        town[type] = { 
                            rank: rank,
                            owned: 1
                        };
                    }
                    if ((building[type]['rank'][rank]['staff'] || building[type].type === 'factory') && !town[type]['workers']) {
                        town[type]['workers'] = 0;
                    }
                    if (building[type]['rank'][rank]['foreman'] && !town[type]['foreman']) {
                        town[type]['foreman'] = 0;
                    }
                    if (building[type]['rank'][rank]['manager'] && !town[type]['manager']) {
                        town[type]['manager'] = 0;
                    }
                    if (building[type]['rank'][rank].effect) {
                        building[type]['rank'][rank].effect(town,type);
                    }
                    loadCityMap(town.id);
                    tileInfo(town, x, y, z);
                }
            });
        }
    }
}

function loadCityMap(id) {
    $('#city_map' + id).empty();
    var svg = SVG('city_map' + id);
    hexGrid(city[id],svg);
}

function loadCityLedger(id) {
    var ledger = $('<div id="city_ledger' + id + '" class="ledger d-flex"></div>');
    $('#ledger_pane').append(ledger);
}

function loadCityStorage(id) {
    $('.popover').each(function () {
        $(this).popover('hide');
    });
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
        
        var harvesting = false;
        clicker.on('click',function(e){
            e.preventDefault();
            if (harvesting === true || intervals[res]) {
                return false;
            }
            harvesting = true;
            var bar = $('#' + res + 'ProgressBar');
            var width = 1;
            intervals[res] = setInterval(function() {
                if (width >= 100) {
                    clearInterval(intervals[res]);
                    delete intervals[res];
                    var yield = global['resource'][res]['yield'];
                    var storage_sum = Number(Object.keys(city[id]['storage']).length ? Object.values(city[id]['storage']).reduce((a, b) => a + b) : 0);
                    if (yield + storage_sum > city[0].storage_cap) {
                        yield = city[0].storage_cap - storage_sum;
                    }
                    city[0]['storage'][res] += yield;
                    storage_sum += yield;
                    $('#cityStorage' + id).html(storage_sum + ' / ' + city[id]['storage_cap']);
                    bar.width('0');
                    harvesting = false;
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
            if (city[id]['trading_post'] && city[id]['trading_post'].workers > 0) {
                return $('<a href="#">Sell $' + global['resource'][res]['value'] + '/unit</a>').on('click',function(e){
                    if (city[id]['storage'][res] > 0) {
                        city[id]['storage'][res]--;
                        global['money'] += global['resource'][res]['value'];
                        if (city[id]['storage'][res] <= 0) {
                            $('#pop' + id + res).popover('toggle');
                        }
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
        
        $('#blueprints' + id).find('[data-' + res +']').each(function(e){
            var res_cost = $(this).attr('data-' + res);
            if (res_cost > newValue) {
                $(this).addClass('unaffordable');
            }
            else {
                $(this).removeClass('unaffordable');
            }
        });
        if (id === 0) {
            $('#research').find('[data-' + res +']').each(function(e){
                var res_cost = $(this).attr('data-' + res);
                if (res_cost > newValue) {
                    $(this).addClass('unaffordable');
                }
                else {
                    $(this).removeClass('unaffordable');
                }
            });
        }
    });
}

function loadInfoBar(id) {
    var container = $('<div id="info' + id + '" class="row"></div>');
    var money = $('<div class="money col-2">$' + global['money'] + '</div>');
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
        $('#blueprints' + id).find('[data-money]').each(function(e){
            var res_cost = $(this).attr('data-money');
            if (res_cost > newValue) {
                $(this).addClass('unaffordable');
            }
            else {
                $(this).removeClass('unaffordable');
            }
        });
        if (id === 0) {
            $('#research').find('[data-money]').each(function(e){
                var res_cost = $(this).attr('data-money');
                if (res_cost > newValue) {
                    $(this).addClass('unaffordable');
                }
                else {
                    $(this).removeClass('unaffordable');
                }
            });
        }
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
}

function loadProspect(modal, id, x, y, z) {
    var prospect_id = String(x)+String(y)+String(z);
    var town = city[id];
    if (town['prospecting_offer'][prospect_id]) {
        var container = $('<div id="prospecting" class="city prospect offer"></div>');
        var header = $('<div class="header row"><div class="col" id="prospecting' + prospect_id + 'title">Prospecting Complete</div></div>');
        container.append(header);
        
        if (Object.keys(town['prospecting_offer'][prospect_id]).length === 0) {
            
            var row = $('<div class="row"></div>');
            var fail = $('<div class="col">Failed to locate usable resources</div>');
            row.append(fail);
            container.append(row);
            
            var option_row = $('<div class="row"></div>');
            var discard_col = $('<div class="col"></div>');
            var discard = $('<button class="prospect">Abandon</button>');
            
            discard_col.append(discard);
            option_row.append(discard_col);
            container.append(option_row);
            
            modal.append(container);
            
            discard.on('click',function(e){
                e.preventDefault();
                delete town.prospecting_offer[prospect_id];
                tileInfo(town, x, y, z);
                loadCityMap(id);
            });
        }
        else {
            var mineral = Object.keys(town.prospecting_offer[prospect_id]).reduce(function(a, b){ return town.prospecting_offer[prospect_id][a] > town.prospecting_offer[prospect_id][b] ? a : b });
            var row = $('<div class="row"></div>');
            
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
            
            var type = $('<div class="col">' + prefix + nameCase(mineral) + ' Mine</div>');
            row.append(type);
            container.append(row);
            
            var cash_row = $('<div class="row"></div>');
            var cost = inflation(town,'mine',town['mine'].length * 100);
            var cash_cost = $('<div class="col">$' + cost + '</div>');
            cash_row.append(cash_cost);
            container.append(cash_row);
            
            var lumber_row = $('<div class="row"></div>');
            var lumber_cost = inflation(town,'mine',(town['mine'].length + 1) * 25);
            var lumber_col = $('<div class="col">Lumber</div><div class="col">' + lumber_cost + '</div>');
            lumber_row.append(lumber_col);
            container.append(lumber_row);
            
            var option_row = $('<div class="row"></div>');
            var discard_col = $('<div class="col"></div>');
            var construct_col = $('<div class="col"></div>');
            var discard = $('<button class="prospect">Abandon</button>');
            var construct = $('<button class="prospect">Build</button>');
            discard_col.append(discard);
            construct_col.append(construct);
            option_row.append(discard_col);
            option_row.append(construct_col);
            container.append(option_row);
            
            modal.append(container);
            
            discard.on('click',function(e){
                e.preventDefault();
                delete town.prospecting_offer[prospect_id];
                tileInfo(town, x, y, z);
                loadCityMap(id);
            });
            
            construct.on('click',function(e){
                e.preventDefault();
                
                if (global['money'] >= cost && town['storage']['lumber'] >= lumber_cost) {
                    global['money'] -= cost;
                    town['storage']['lumber'] -= lumber_cost;
                    
                    var mine = {
                        id: 'mine' + global['next_id'],
                        name: nameCase(mineral) + ' Mine',
                        type: 'mine',
                        resources: town.prospecting_offer[prospect_id],
                        workers: 0,
                        manager: 0,
                        rank: 0,
                        x: x,
                        y: y,
                        z: z
                    };
                    town['mine'].push(mine);
                    
                    var struct = {  
                        type: 'mine',
                        id: mine.id,
                        svg: building['mine'].rank[0].svg,
                        x: 0,
                        y: 0
                    };
                    town.map[x][y][z] = [struct];
                    
                    global['next_id']++;
                    delete town.prospecting_offer[prospect_id];
                    loadCityMap(town.id);
                    tileInfo(town, x, y, z);
                }
            });
        }
    }
    else if (town['prospecting'] === false || String(city[id].prospect_id.x)+String(city[id].prospect_id.y)+String(city[id].prospect_id.z) === prospect_id) {
        var container = $('<div id="prospecting' + prospect_id + '" class="city prospect"></div>');
        var header = $('<div class="header row"><div class="col" id="prospecting' + prospect_id + 'title">Prospect Land</div></div>');
        container.append(header);
        var price = 0;
        var row = $('<div class="row"></div>');
        price = inflation(town,'mine',((town['mine'].length + Object.keys(town['prospecting_offer']).length) * 100));
        var cost = $('<div class="col">$' + price + '</div>');
        row.append(cost);
        container.append(row);
        modal.append(container);
        
        container.on('click',function(e){
            e.preventDefault();
            
            if (town.prospecting === false && global['money'] >= price) {
                global['money'] -= price;
                town.prospecting = Math.ceil((town.mine.length + 1) * 15 * biomes[town.biome].cost);
                town.prospect_id = { 'x': x, 'y': y, 'z': z };
                $('#prospecting' + prospect_id + 'title').html('Prospecting 0%');
            }
        });
    }
}

function loadMineOptions(town, mine, x, y, z) {
    var container = $('<div id="' + mine['id'] + '" class="city mine"></div>');
    
    if (!mine['manager']) {
        mine['manager'] = 0;
    }
    
    var count_manager;
    if (global['overseer'] >= 2 && building['mine']['rank'][mine['rank']]['manager']) {
        var manager = $('<div class="col"></div>');
        var remove_manager = $('<span id="' + mine['id'] + 'RemoveManager" class="remove">&laquo;</span>');
        var add_manager = $('<span id="' + mine['id'] + 'AddManager" class="add">&raquo;</span>');
        count_manager = $('<span id="' + mine['id'] + 'Manager" class="workers" title="' + jobTitle(town,'manager') + '">' + mine['manager'] + '/1 ' + jobs['manager']['title'] + '</span>');
        
        manager.append(remove_manager);
        manager.append(count_manager);
        manager.append(add_manager);
        container.append(manager);
    }
    
    var workers = $('<div class="col"></div>');
    var remove = $('<span id="' + mine['id'] + 'RemoveWorker" class="remove">&laquo;</span>');
    var add = $('<span id="' + mine['id'] + 'AddWorker" class="add">&raquo;</span>');
    var count = $('<span id="' + mine['id'] + 'Workers" class="workers" title="' + jobTitle(town,'miner') + '">' + mine['workers'] + '/' + building['mine']['rank'][mine['rank']]['labor_cap'] + ' Miners</span>');
    
    workers.append(remove);
    workers.append(count);
    workers.append(add);
    
    container.append(workers);
    
    $('#modalContent').append(container);
    
    if (global['overseer'] >= 2 && building['mine']['rank'][mine['rank']]['manager']) {
        $('#' + mine['id'] + 'RemoveManager').on('click',function(e){
            e.preventDefault();
            
            if (Number(mine['manager']) > 0) {
                mine['manager']--;
                town['citizen']['idle']++;
                count_manager.html(mine['manager'] + '/1 ' + jobs['manager']['title']);
            }
        });
        
        $('#' + mine['id'] + 'AddManager').on('click',function(e){
            e.preventDefault();
            
            if (Number(town['citizen']['idle']) > 0 && mine['manager'] < 1) {
                mine['manager']++;
                town['citizen']['idle']--;
                count_manager.html(mine['manager'] + '/1 ' + jobs['manager']['title']);
            }
        });
    }
    
    $('#' + mine['id'] + 'RemoveWorker').on('click',function(e){
        e.preventDefault();
        
        if (Number(mine['workers']) > 0) {
            mine['workers']--;
            town['citizen']['idle']++;
        }
    });
    
    $('#' + mine['id'] + 'AddWorker').on('click',function(e){
        e.preventDefault();
        
        if (Number(town['citizen']['idle']) > 0 && mine['workers'] < building['mine']['rank'][mine['rank']]['labor_cap']) {
            mine['workers']++;
            town['citizen']['idle']--;
        }
    }); 
    
    if (vue[mine['id'] + 'workers']) {
        // Do Nothing
    }
    else {
        vue[mine['id'] + 'workers'] = new Vue({
            data: mine
        });
        unwatch[mine['id'] + 'workers'] = vue[mine['id'] + 'workers'].$watch('workers', function (newValue, oldValue) {
            $('#' + mine['id'] + 'Workers').html(newValue + '/' + building['mine']['rank'][mine['rank']]['labor_cap'] + ' Miners');
        });
    }
    
    var set_watch = true;
    if (vue[mine['id']]) {
        set_watch = false;
    }
    else {
        vue[mine['id']] = new Vue({
            data: mine['resources']
        });
    }
    
    var minerals = $('<div></div>');
    Object.keys(mine['resources']).forEach(function (mineral) {
        var row = $('<div class="row"></div>');
        var type = $('<span class="col">' + nameCase(mineral) + ' </span>');
        var remain = $('<span class="col" id="' + mine['id'] + mineral + '">' + mine['resources'][mineral] + '</span>');
        row.append(type);
        row.append(remain);
        
        if (set_watch) {
            unwatch[mine['id'] + mineral] = vue[mine['id']].$watch(mineral, function (newValue, oldValue) {
                $('#' + mine['id'] + mineral).html(newValue);
            });
        }
        
        container.append(row);
    });
    
    var option_row = $('<div class="row"></div>');
    var discard_col = $('<div class="col"></div>');
    var discard = $('<button title="Remove this mine from your city register">Close Mine</button>');
    option_row.append(discard_col);
    discard_col.append(discard);
    container.append(option_row);
    
    discard.on('click',function(e){
        e.preventDefault();
        
        Object.keys(mine['resources']).forEach(function (mineral) {
            mine['resources'][mineral] = 0;
        });
        
        $('#modal').modal('toggle');
    });
}

function payBuildingCosts(town,build,rank) {
    var paid = true;
    Object.keys(building[build]['rank'][rank]['cost']).forEach(function (cost) {
        if (cost === 'money') {
            if (global['money'] < inflation(town,build,building[build]['rank'][rank]['cost'][cost])) {
                paid = false;
                return;
            }
        }
        else if (town['storage'][cost] < inflation(town,build,building[build]['rank'][rank]['cost'][cost])) {
            paid = false;
            return;
        }
    });
    if (paid) {
        Object.keys(building[build]['rank'][rank]['cost']).forEach(function (cost) {
            if (cost === 'money') {
                global['money'] -= Number(inflation(town,build,building[build]['rank'][rank]['cost'][cost]));
            }
            else {
                town['storage'][cost] -= Number(inflation(town,build,building[build]['rank'][rank]['cost'][cost]));
            }
        });
    }
    return paid;
}

function jobTitle(town,title) {
    var desc = jobs[title].desc;
    if (global['economics'] >= 4) {
        desc = desc + '\n\nGenerates $' + (town['tax_rate'] * jobs[title].tax * 2) + '/min in tax revenue per employee.';
    }
    else if (global['economics'] >= 2) {
        desc = desc + '\n\nGenerates $' + (town['tax_rate'] * jobs[title].tax) + '/min in tax revenue per employee.';
    }
    return desc;
}
