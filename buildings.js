function defineBuildings() {
    
    // Mines are the primary source of most resources, they require workers and can deplete
    building['mine'] = {
        type: 'mine',
        rank: [
            {
                name: 'Mine',
                require: { mining: 1 },
                description: 'Construct a Mine',
                labor: 'miner',
                labor_cap: 10,
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
                town['storage'][res] = (town['storage'][res] || 0) + Number(harvesters);
                mine['resources'][res] -= Number(harvesters);
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
                staff: true,
                labor: 'trader',
                labor_cap: 1,
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
                description: 'The farm increases your food supply, which makes gaining new citizens easier. Assign farmers to boost citizen gain rate.',
                labor: 'farmer',
                labor_cap: 5,
                cost: { 
                    money: 500,
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
                description: 'Workers assgined to the Lumber Mill will automatically harvest lumber.',
                labor: 'miller',
                labor_cap: 5,
                cost: { 
                    copper: 10,
                    iron: 25,
                    lumber: 25
                }
            }
        ],
        produce: function (town, building) {
            var workers = town[building].workers;
            if (workers === 0) {
                return;
            }
            var sum = Number(Object.keys(town['storage']).length ? Object.values(town['storage']).reduce((a, b) => a + b) : 0);
            if (workers > town.storage_cap - sum) {
                workers = town.storage_cap - sum;
            }
            if (town['storage']['lumber']) {
                town['storage']['lumber'] += Number(workers);
            }
            else {
                town['storage']['lumber'] = Number(workers);
            }
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
                description: 'Workers assgined to the Rock Quarry will automatically mine stone.',
                labor: 'quarry',
                labor_cap: 5,
                cost: { 
                    iron: 50,
                    lumber: 50
                }
            }
        ],
        produce: function (town, building) {
            var workers = town[building].workers;
            if (workers === 0) {
                return;
            }
            var sum = Number(Object.keys(town['storage']).length ? Object.values(town['storage']).reduce((a, b) => a + b) : 0);
            if (workers > town.storage_cap - sum) {
                workers = town.storage_cap - sum;
            }
            if (town['storage']['stone']) {
                town['storage']['stone'] += Number(workers);
            }
            else {
                town['storage']['stone'] = Number(workers);
            }
        }
    };
    
    // Allows player to asign citizens as quarry workers, who automatically harvest lumber
    building['cement_plant'] = {
        type: 'factory',
        limit: 1,
        rank: [
            {
                name: 'Cement Plant',
                require: { minerals: 2, knowledge: 5 },
                description: 'The cemenet plant consumes stone and produces cement.',
                labor: 'factory',
                labor_cap: 5,
                cost: { 
                    money: 100,
                    iron: 50,
                    lumber: 50
                }
            }
        ],
        produce: function (town, building) {
            var workers = town[building].workers;
            if (workers === 0) {
                return;
            }
            var sum = Number(Object.keys(town['storage']).length ? Object.values(town['storage']).reduce((a, b) => a + b) : 0);
            if (workers > town.storage_cap - sum) {
                workers = town.storage_cap - sum;
            }
            if (town['storage']['stone'] < workers) {
                workers = town['storage']['stone'];
            }
            if (town['storage']['cement']) {
                town['storage']['stone'] -= Number(workers);
                town['storage']['cement'] += Number(workers);
            }
            else {
                town['storage']['stone'] -= Number(workers);
                town['storage']['cement'] = Number(workers);
            }
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
                description: 'The Steel Mill consumes iron and coal to make steel.',
                labor: 'miller',
                labor_cap: 5,
                cost: { 
                    money: 100,
                    coal: 25,
                    iron: 50,
                    lumber: 100
                }
            }
        ],
        produce: function (town, building) {
            var workers = town[building].workers;
            if (workers === 0 || !town['storage']['iron'] || !town['storage']['coal']) {
                return;
            }
            var sum = Object.values(town.storage).reduce((a, b) => a + b);
            if (workers > town.storage_cap - sum) {
                workers = town.storage_cap - sum;
            }
            if ( workers * 2 > town['storage']['iron'] ) {
                workers = Math.floor(town['storage']['iron'] / 2);
            }
            if ( workers > town['storage']['coal'] ) {
                workers = town['storage']['coal'];
            }
            town['storage']['iron'] -= Number(workers) * 2;
            town['storage']['coal'] -= Number(workers);
            if (town['storage']['steel']) {
                town['storage']['steel'] += Number(workers);
            }
            else {
                town['storage']['steel'] = Number(workers);
            }
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
                description: 'The greenhouse increases the effectiveness of your farmers.',
                cost: { 
                    money: 5000,
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
                description: 'A simple hut made out of stone and wood, houses one citizen.',
                limit: 5,
                cost: { 
                    stone: 12,
                    lumber: 8
                },
                effect: function (town, building) {
                    town['citizen']['max'] += 1;
                }
            },
            {
                name: 'House',
                require: { minerals: 2, tech: 3 },
                description: 'A modern house, with all the conveniences, houses one citizen',
                cost: { 
                    money: 50,
                    cement: 6,
                    lumber: 8,
                    copper: 2,
                    iron: 3
                },
                effect: function (town, building) {
                    town['citizen']['max'] += 1;
                }
            }
        ]
    };
    
    building['medium_house'] = {
        type: 'storage',
        inflation: { 
            scale: 'linear',
            ammount: 0.5
        },
        rank: [
            {
                name: 'Apartment Building',
                require: { housing: 2, minerals: 4, tech: 3 },
                description: 'An apartment building, houses 5 citizens',
                cost: { 
                    money: 1000,
                    cement: 30,
                    lumber: 50,
                    copper: 20,
                    steel: 50
                },
                effect: function (town, building) {
                    town['citizen']['max'] += 5;
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
                description: 'A simple shed to store resources, increaases city storage limit by 20.',
                limit: 5,
                cost: { 
                    stone: 4,
                    lumber: 8,
                    iron: 2
                },
                effect: function (town, building) {
                    town['storage_cap'] += 20;
                }
            },
            {
                name: 'Storage Shed',
                require: { minerals: 2, warehouse: 1, tech: 3 },
                description: 'A sturdy shed to store resources, increaases city storage limit by 20.',
                cost: { 
                    money: 75,
                    cement: 4,
                    lumber: 8,
                    copper: 2,
                    iron: 2
                },
                effect: function (town, building) {
                    town['storage_cap'] += 20;
                }
            }
        ]
    };
}
