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
        produce: function (town,mine) {
            var sum = Object.values(mine['resources']).reduce((a, b) => a + b);
            
            // Extract ores
            var work = mine['workers'];
            var unused = work;
            Object.keys(mine['resources']).forEach(function (res) {
                var remain = mine['resources'][res];
                var ratio = remain / sum;
                var harvesters = Math.ceil(work * ratio);
                var storage_sum = Number(Object.keys(town['storage']).length ? Object.values(town['storage']).reduce((a, b) => a + b) : 0);
                if (harvesters > town['storage_cap'] - storage_sum) {
                    harvesters = town['storage_cap'] - storage_sum;
                }
                if (harvesters > mine['resources'][res]) {
                    harvesters = mine['resources'][res];
                }
                if (harvesters > unused) {
                    harvesters = unused;
                }
                unused -= harvesters;
                town['storage'][res] = (town['storage'][res] || 0) + harvesters;
                mine['resources'][res] -= harvesters;
            });
        }
    };
    
    building['trading_post'] = {
        type: 'unique',
        limit: 1,
        rank: [
            {
                name: 'Trading Post',
                require: { economics: 1 },
                description: 'Allows spare resources to be sold for money',
                cost: { 
                    lumber: 20,
                    stone: 20
                }
            }
        ]
    };
    
    // The number of farmers you have affects how fast you get new citizens
    building['farm'] = {
        type: 'factory',
        limit: 1,
        rank: [
            {
                name: 'Farm',
                require: { minerals: 2, farming: 1 },
                description: 'The farm increases your food supply, which makes gaining new citizens easier',
                labor: 'Farmers',
                cost: { 
                    copper: 25,
                    iron: 25,
                    lumber: 100,
                    stone: 100
                }
            }
        ]
    };
    
    // Allows player to asign citizens as lumberjacks, who automatically harvest lumber
    building['lumber_mill'] = {
        type: 'factory',
        limit: 1,
        rank: [
            {
                name: 'Lumber Mill',
                require: { minerals: 2, knowledge: 5 },
                description: 'Construct a Lumber Mill',
                labor: 'Mill Workers',
                cost: { 
                    copper: 10,
                    iron: 25,
                    lumber: 25
                }
            }
        ],
        produce: function (town, building) {
            var workers = town[building].workers;
            var sum = Number(Object.keys(town['storage']).length ? Object.values(town['storage']).reduce((a, b) => a + b) : 0);
            if (workers > town.storage_cap - sum) {
                workers = town.storage_cap - sum;
            }
            town['storage']['lumber'] += workers;
        }
    };
    
    // Allows player to asign citizens as quarry workers, who automatically harvest lumber
    building['rock_quarry'] = {
        type: 'factory',
        limit: 1,
        rank: [
            {
                name: 'Rock Quarry',
                require: { minerals: 2, knowledge: 5 },
                description: 'Construct a Rock Quarry',
                labor: 'Quarry Workers',
                cost: { 
                    iron: 50,
                    lumber: 50
                }
            }
        ],
        produce: function (town, building) {
            var workers = town[building].workers;
            var sum = Number(Object.keys(town['storage']).length ? Object.values(town['storage']).reduce((a, b) => a + b) : 0);
            if (workers > town.storage_cap - sum) {
                workers = town.storage_cap - sum;
            }
            town['storage']['stone'] += workers;
        }
    };
    
    // Produces steel, requires workers
    building['steel_mill'] = {
        type: 'factory',
        limit: 1,
        rank: [
            {
                name: 'Steel Mill',
                require: { minerals: 4, mining: 3 },
                description: 'Construct a Steel Mill',
                labor: 'Mill Workers',
                cost: { 
                    coal: 25,
                    iron: 50,
                    lumber: 100
                }
            }
        ],
        produce: function (town, building) {
            var workers = town[building].workers;
            var sum = Object.values(town.storage).reduce((a, b) => a + b);
            if (workers > town.storage_cap - sum) {
                workers = town.storage_cap - sum;
            }
            town['storage']['steel'] += workers;
        }
    };
    
    // Adds a one time bonus to farm effectiveness
    building['greenhouse'] = {
        type: 'unique',
        limit: 1,
        rank: [
            {
                name: 'Green House',
                require: { minerals: 2, farming: 2 },
                description: 'Construct a greenhouse which increases your farm effectiveness',
                cost: { 
                    coal: 250,
                    iron: 250,
                    lumber: 1000
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
                effect: function (town, building) {
                    town['citizen']['max'] += 2;
                }
            },
            {
                name: 'House',
                require: { minerals: 2, tech: 3 },
                description: 'Construct a modern house, with all the conveniences',
                cost: { 
                    stone: 6,
                    lumber: 8,
                    copper: 2,
                    iron: 3
                },
                effect: function (town, building) {
                    town['citizen']['max'] += 2;
                }
            }
        ]
    };
    
    building['shed'] = {
        type: 'storage',
        inflation: { 
            scale: 'linear',
            ammount: 0.5
        },
        rank: [
            {
                name: 'Storage Shed',
                require: { minerals: 2, warehouse: 1 },
                description: 'Construct a simple shed to store resources',
                cost: { 
                    stone: 4,
                    lumber: 8,
                    iron: 2
                },
                effect: function (town, building) {
                    town['storage_cap'] += 25;
                }
            }
        ]
    };
}
