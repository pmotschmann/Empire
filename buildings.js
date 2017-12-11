function loadCity() {
    
    var city_data = save.getItem('city') || false;
    if (city_data) {
        city = JSON.parse(city_data);
    }
    else {
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
        
        save.setItem('knowledge',0);
    }
    
    loadMines();
}

// Load Mines into UI
function loadMines() {
    $('#mines').empty();
    
    Object.keys(city['mine']).forEach(function (key) {
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
    });
}

function defineBuildings() {
    
    // Mines are the primary source of most resources, they require workers and can deplete
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
    
    // Produces steel, requires workers
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
    
    // Allows player to asign citizens as lumberjacks, who automatically harvest lumber
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
                    copper: 25,
                    iron: 25,
                    lumber: 50,
                }
            }
        ],
        produce: function () {
            resources['lumber']['amount'] += city['lumber_mill']['workers'];
        }
    };
    
    // The number of farmers you have affects how fast you get new citizens
    building['farm'] = {
        type: 'factory',
        limit: 1,
        rank: [
            {
                name: 'Farm',
                require: { knowledge: 4 },
                description: 'The farm increases your food supply, which makes attracting new citizens easier',
                workers: 10,
                cost: { 
                    coal: 250,
                    iron: 250,
                    lumber: 1000,
                },
                effect: function () {
                    
                }
            }
        ],
        produce: function () {
            // Nothing
        }
    };
    
    // Adds a one time bonus to farm effectiveness
    building['greenhouse'] = {
        type: 'unique',
        limit: 1,
        rank: [
            {
                name: 'Green House',
                require: { city: 3 },
                description: 'Construct a greenhouse which increases your farm effectiveness',
                cost: { 
                    coal: 250,
                    iron: 250,
                    lumber: 1000
                },
                effect: function () {
                    save.setItem('steelUnlocked',1);
                }
            }
        ]
    };
    
    building['small_house'] = {
        type: 'storage',
        rank: [
            {
                name: 'Stone Hut',
                require: { knowledge: 1 },
                description: 'Construct a simple hut made out of stone and wood',
                cost: { 
                    stone: Math.ceil(12 * (city['storage']['small_house']['quantity'] || 0.5)),
                    lumber: Math.ceil(8 * (city['storage']['small_house']['quantity'] || 0.5))
                },
                effect: function () {
                    resources['citizen']['max'] += 2;
                }
            },
            {
                name: 'House',
                require: { tech: 2 },
                description: 'Construct a modern house, with all the conveniences',
                cost: { 
                    stone: Math.ceil(6 * (city['storage']['small_house']['quantity'] || 0.5)),
                    lumber: Math.ceil(8 * (city['storage']['small_house']['quantity'] || 0.5)),
                    copper: Math.ceil(2 * (city['storage']['small_house']['quantity'] || 0.5))
                },
                effect: function () {
                    resources['citizen']['max'] += 2;
                }
            }
        ]
    };
}
