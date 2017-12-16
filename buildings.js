function defineBuildings() {
    
    // Mines are the primary source of most resources, they require workers and can deplete
    building['mine'] = {
        type: 'mine',
        rank: [
            {
                name: 'Mine',
                require: { mining: 1 },
                description: 'Construct a Mine',
                cost: { 
                    lumber: 50,
                    iron: 25
                }
            }
        ],
        produce: function (mine) {
            var sum = Object.values(mine['resources']).reduce((a, b) => a + b);
            
            // Extract ores
            var work = mine['workers'];
            var unused = work;
            Object.keys(mine['resources']).forEach(function (res) {
                var remain = mine['resources'][res];
                var ratio = remain / sum;
                var harvesters = Math.ceil(work * ratio);
                if (harvesters > resources[res]['max'] - resources[res]['amount']) {
                    harvesters = resources[res]['max'] - resources[res]['amount'];
                }
                if (harvesters > mine['resources'][res]) {
                    harvesters = mine['resources'][res];
                }
                if (harvesters > unused) {
                    harvesters = unused;
                }
                unused -= harvesters;
                resources[res]['amount'] += harvesters;
                mine['resources'][res] -= harvesters;
            });
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
                cost: { 
                    copper: 25,
                    iron: 25,
                    lumber: 25
                }
            }
        ],
        produce: function (town, index) {
            var workers = town[index].workers;
            if (workers > resources['lumber']['max'] - resources['lumber']['amount']) {
                workers = resources['lumber']['max'] - resources['lumber']['amount'];
            }
            resources['lumber']['amount'] += workers;
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
                description: 'The farm increases your food supply, which makes gaining new citizens easier',
                cost: { 
                    copper: 25,
                    iron: 25,
                    lumber: 100,
                    stone: 100
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
                cost: { 
                    coal: 250,
                    iron: 250,
                    lumber: 1000
                },
                effect: function () {
                    save.setItem('steelUnlocked',1);
                }
            }
        ],
        produce: function (town, index) {
            var workers = town[index].workers;
            if (workers > resources['steel']['max'] - resources['steel']['amount']) {
                workers = resources['steel']['max'] - resources['steel']['amount'];
            }
            resources['steel']['amount'] += workers;
        }
    };
    
    // Adds a one time bonus to farm effectiveness
    building['greenhouse'] = {
        type: 'unique',
        limit: 1,
        rank: [
            {
                name: 'Green House',
                require: { farming: 2 },
                description: 'Construct a greenhouse which increases your farm effectiveness',
                cost: { 
                    coal: 250,
                    iron: 250,
                    lumber: 1000
                },
                effect: function () {
                    
                }
            }
        ]
    };
    
    building['small_house'] = {
        type: 'storage',
        inflation: { 
            scale: 'linear',
            ammount: 0.5
        },
        rank: [
            {
                name: 'Stone Hut',
                require: { housing: 1 },
                description: 'Construct a simple hut made out of stone and wood',
                cost: { 
                    stone: 12,
                    lumber: 8
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
                    stone: 6,
                    lumber: 8,
                    copper: 2
                },
                effect: function () {
                    resources['citizen']['max'] += 2;
                }
            }
        ]
    };
}
