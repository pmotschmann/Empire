function loadCity() {
    
    var city_data = save.getItem('city') || false;
    if (city_data) {
        city = JSON.parse(city_data);
    }
    else {
        city['mine'] = [
            {
                id: 'mine0',
                name: 'Basic Mine',
                type: 'mine',
                resources: {
                    stone: 50000,
                    copper: 25000,
                    iron: 10000,
                },
                workers: 0
            }
        ];
        
        city['structure'] = {};
        city['unique'] = {};
        city['next_id'] = 0;
        
        save.setItem('knowledge',0);
    }
    
    loadMines();
}

// Load Mines into UI
function loadMines() {
    $('#mines').empty();
    
    Object.keys(city['mine']).forEach(function (key) {
        var mine = $('<div id="' + city['mine'][key]['id'] + '" class="city mine"></div>');
        var header = $('<div class="header">' + city['mine'][key]['name'] +'</div>');
        mine.append(header);
        
        var management = $('<div class="d-flex flex-row"></div>');
        var workers = $('<div id="' + city['mine'][key]['id'] + 'Workers" class="workers"></div>');
        var add = $('<div id="' + city['mine'][key]['id'] + 'AddWorker" class="add"></div>');
        var remove = $('<div id="' + city['mine'][key]['id'] + 'RemoveWorker" class="remove"></div>');
        
        management.append(workers);
        management.append(add);
        management.append(remove);
        mine.append(management);
        
        var vm_r = new Vue({
            data: city['mine'][key]['resources']
        });
        
        var minerals = $('<div></div>');
        Object.keys(city['mine'][key]['resources']).forEach(function (mineral) {
            var row = $('<div></div>');
            var type = $('<span>' + nameCase(mineral) + ' </span>');
            var remain = $('<span id="' + city['mine'][key]['id'] + mineral + '">' + city['mine'][key]['resources'][mineral] + '</span>');
            row.append(type);
            row.append(remain);
            
            vm_r.$watch(mineral, function (newValue, oldValue) {
                remain.html(newValue);
            });
            
            mine.append(row);
        });
        
        $('#mines').append(mine);
    });
}

function defineBuildings() {
    
    building['mine'] = {
        type: 'mine',
        rank: [
            {
                name: 'Mine',
                require: { mining: 1 },
                description: 'Construct a Mine',
                workers: 10,
                cost: { 
                    lumber: 50,
                    iron: 25
                },
                effect: function () {
                    city['mine']
                }
            }
        ]
    };
    
    building['steel_mill'] = {
        type: 'factory',
        limit: 1,
        rank: [
            {
                name: 'Steel Mill',
                require: { mining: 4 },
                description: 'Construct a Steel Mill',
                workers: 10,
                cost: { 
                    coal: 250,
                    iron: 250,
                    lumber: 1000,
                },
                effect: function () {
                    save.setItem('steelUnlocked',1);
                }
            }
        ],
        produce: function () {
            resources['steel']['amount'] += city['steel_mill']['workers'];
        }
    };
    
    building['lumber_mill'] = {
        type: 'factory',
        limit: 1,
        rank: [
            {
                name: 'Lumber Mill',
                require: { knowledge: 5 },
                description: 'Construct a Lumber Mill',
                workers: 10,
                cost: { 
                    copper: 50,
                    iron: 50,
                    lumber: 250,
                }
            }
        ],
        produce: function () {
            resources['lumber']['amount'] += city['lumber_mill']['workers'];
        }
    };
    
    building['small_house'] = {
        type: 'storage',
        rank: [
            {
                name: 'Stone Hut',
                require: { knowledge: 1 },
                description: 'Construct a simple hut made out of stone and wood',
                cost: { 
                    stone: 25,
                    lumber: 10
                },
                effect: function () {
                    resources['citizen']['max'] += 2;
                }
            }
        ]
    };
}
