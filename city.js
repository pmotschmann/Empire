function loadCity() {
    
    var city_data = save.getItem('city') || false;
    if (city_data) {
        // Load preexiting game data
        city = JSON.parse(city_data);
    }
    else {
        // New game, setup starter state
        // Player starts with a starter mine
        city['mine'] = [
            {
                id: 'mine0',
                name: 'Basic Mine',
                type: 'mine',
                resources: {
                    stone: 5000,
                    copper: 2500,
                    iron: 1000,
                },
                workers: 0
            }
        ];
        
        // Set general knowledge to 0
        save.setItem('knowledge',0);
    }
    
    loadMines();
}

// Reloads all mines into UI
function loadMines() {
    $('#mines').empty();
    
    Object.keys(city['mine']).forEach(function (key) {
        registerMine(key);
    });
}

// Adds an individual mine to the UI
function registerMine(key) {
    var mine = $('<div id="' + city['mine'][key]['id'] + '" class="city mine"></div>');
    
    var header = $('<div class="header row"><div class="col">' + city['mine'][key]['name'] +'</div></div>');
    var workers = $('<div class="col"></div>');
    var remove = $('<span id="' + city['mine'][key]['id'] + 'RemoveWorker" class="remove">&laquo;</span>');
    var add = $('<span id="' + city['mine'][key]['id'] + 'AddWorker" class="add">&raquo;</span>');
    var count = $('<span id="' + city['mine'][key]['id'] + 'Workers" class="workers">' + city['mine'][key]['workers'] + ' Miners</span>');
    
    workers.append(remove);
    workers.append(count);
    workers.append(add);
    header.append(workers);
    mine.append(header);
    
    $('#' + city['mine'][key]['id'] + 'RemoveWorker').on('click',function(e){
        e.preventDefault();
        
        if (Number(city['mine'][key]['workers']) > 0) {
            city['mine'][key]['workers']--;
            resources['citizen']['idle']++;
        }
    });
    
    $('#' + city['mine'][key]['id'] + 'AddWorker').on('click',function(e){
        e.preventDefault();
                                       
        if (Number(resources['citizen']['idle']) > 0) {
            city['mine'][key]['workers']++;
            resources['citizen']['idle']--;
        }
    });
    
    var vm_w = new Vue({
        data: city['mine'][key]
    });
    
    vm_w.$watch('workers', function (newValue, oldValue) {
        count.html(newValue + ' Miners');
    });
    
    var vm_r = new Vue({
        data: city['mine'][key]['resources']
    });
    
    var minerals = $('<div></div>');
    Object.keys(city['mine'][key]['resources']).forEach(function (mineral) {
        var row = $('<div class="row"></div>');
        var type = $('<span class="col">' + nameCase(mineral) + ' </span>');
        var remain = $('<span class="col" id="' + city['mine'][key]['id'] + mineral + '">' + city['mine'][key]['resources'][mineral] + '</span>');
        row.append(type);
        row.append(remain);
        
        vm_r.$watch(mineral, function (newValue, oldValue) {
            remain.html(newValue);
        });
        
        mine.append(row);
    });
    
    $('#mines').append(mine);
}
