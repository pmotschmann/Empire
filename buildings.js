function loadCity() {
        
    // # General Knowledge level
    city['knowledge'] = Number(save.getItem('knowledge') || 0);
    
    // # Load structures
    Object.keys(city).forEach(function (key) { 
        switch (building[key]['type']) {
            case 'factory':
                city[key] = { 
                    rank: Number(save.getItem(key) || 0), 
                    workers: Number(save.getItem(key+'_workers') || 0),
                    owned: Number(save.getItem(key+'_owned') || 0)
                };
                var vm = new Vue({
                    data: city[key]
                });
                break;
            case 'storage':
                city[key] = { 
                    rank: Number(save.getItem(key) || 0),
                    owned: Number(save.getItem(key+'_owned') || 0)
                };
                break;
        }
        
        var vm = new Vue({
            data: city[key]
        });
        Object.keys(key).forEach(function (subkey) {
            vm.$watch(subkey, function (newValue, oldValue) {
                if (subkey === 'rank') {
                    save.setItem(key,city[key][subkey]);
                }
                else {
                    save.setItem(key + '_' + subkey,city[key][subkey]);
                }
                
            });
        });
    });
}

function defineBuildings() {
    
    building['stone_mine'] = {
        type: 'factory',
        limit: 1,
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
        limit: 1,
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
        limit: 1,
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
        limit: 1,
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
                require: { stone_mine: 1 },
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
