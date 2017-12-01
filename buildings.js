function loadCity() {
    /*city['citizen'] = { 
        total: Number(save.getItem('citizen') || 0,
        free: Number(save.getItem('citizen') || 0,
    };*/
        
    Object.keys(city).forEach(function (key) { 
        switch (building[key]['type']) {
            case 'factory':
                city[key] = { 
                    rank: Number(save.getItem(key)) || 0, 
                    workers: Number(save.getItem(key+'_workers')) || 0
                };
                var vm = new Vue({
                    data: city[key]
                });
                vm.$watch('workers', function (newValue, oldValue) {
                    save.setItem(key + '_workers',city[key]['workers']);
                });
                vm.$watch('rank', function (newValue, oldValue) {
                    save.setItem(key + '_workers',city[key]['workers']);
                });
                break;
        }
    });
}

function defineBuildings() {
    
    building['stone_mine'] = {
        type: 'factory',
        rank: [
            {
                name: 'Rock Quarry',
                require: { mining: 1 },
                description: 'Construct a Rock Quarry',
                upgrade_desc: 'Expand Quary',
                workers: 10,
                cost: { 
                    lumber: 5
                },
                complete: function () {
                    save.setItem('stoneUnlocked',1);
                }
            }
        ],
        produce: function () {
            resources['stone']['amount'] += city['stone_mine']['workers'];
        }
    };
    
    building['copper_mine'] = {
        type: 'factory',
        rank: [
            {
                name: 'Copper Mine',
                require: { mining: 2 },
                description: 'Construct a Copper Mine',
                workers: 10,
                cost: { 
                    lumber: 25
                },
                effect: function () {
                    save.setItem('copperUnlocked',1);
                }
            }
        ],
        produce: function () {
            resources['copper']['amount'] += city['copper_mine']['workers'];
        }
    };
    
    building['iron_mine'] = {
        type: 'factory',
        rank: [
            {
                name: 'Iron Mine',
                require: { mining: 3 },
                description: 'Construct an Iron Mine',
                workers: 10,
                cost: { 
                    lumber: 250
                },
                effect: function () {
                    save.setItem('ironUnlocked',1);
                }
            }
        ],
        produce: function () {
            resources['iron']['amount'] += city['iron_mine']['workers'];
        }
    };
    
    building['coal_mine'] = {
        type: 'factory',
        rank: [
            {
                name: 'Coal Mine',
                require: { mining: 3 },
                description: 'Construct a Coal Mine',
                workers: 10,
                cost: { 
                    lumber: 1000
                },
                effect: function () {
                    save.setItem('coalUnlocked',1);
                }
            }
        ],
        produce: function () {
            resources['coal']['amount'] += city['coal_mine']['workers'];
        }
    };
    
    building['steel_mill'] = {
        type: 'factory',
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
}
