function defineBuildings() {
    
    // Mines are the primary source of most resources, they require workers and can deplete
    building['mine'] = {
        type: 'mine',
        allow: { all: true },
        rank: [
            {
                name: 'Mine',
                svg: 'mine-grey',
                require: { mining: 1 },
                description: 'Construct a Mine',
                manager: true,
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
                if (mine['resources'][res] < 0) {
                    mine['resources'][res] = 0;
                }
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
                if (town.quota[res] && harvesters > (town.quota[res] - town['storage'][res])) {
                    if (mine['manager'] && town['trading_post'] && town['trading_post']['workers']) {
                        if (town['storage'][res] > town.quota[res]) {
                            var stored_exess = town['storage'][res] - town.quota[res];
                            town['storage'][res] = town.quota[res];
                            global.money += stored_exess * global.resource[res].value;
                        }
                        var excess = harvesters - (town.quota[res] - town['storage'][res]);
                        global.money += excess * global.resource[res].value;
                        mine['resources'][res] -= excess;
                    }
                    harvesters = town.quota[res] - town['storage'][res];
                }
                if (Number(harvesters) > 0) {
                    unused -= harvesters;
                    town['storage'][res] = (town['storage'][res] || 0) + Number(harvesters);
                    mine['resources'][res] -= Number(harvesters);
                }
            });
        }
    };
    
    building['city_hall'] = {
        type: 'unique',
        limit: 1,
        allow: { all: true },
        rank: [
            {
                name: 'Encampment',
                svg: 'campfire',
                description: 'A simple camp to use as your opperating base.',
                cost: { 
                    lumber: 1,
                    stone: 1
                }
            },
            {
                name: 'City Hall',
                svg: 'cityhall',
                require: { government: 1 },
                description: 'The center of govenment of any city. Allows advanced management of your city.',
                staff: true,
                labor: 'bureaucrat',
                labor_cap: function(){ return global['government'] >= 4 ? 5 : 3; }(),
                cost: { 
                    money: 100,
                    lumber: 50,
                    stone: 50,
                    copper: 10,
                    iron: 10
                }
            }
        ]
    };
    
    building['trading_post'] = {
        type: 'unique',
        limit: 1,
        allow: { all: true },
        rank: [
            {
                name: 'Trading Post',
                svg: 'tradepost',
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
        allow: { all: true },
        rank: [
            {
                name: 'Farm',
                svg: 'farm',
                require: { minerals: 2, farming: 1 },
                description: 'The farm increases your food supply, which makes gaining new citizens easier. Assign farmers to boost citizen gain rate.',
                staff: true,
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
        allow: {
            capital: true,
            grassland: true,
            mountain: true,
            forest: true,
            wetland: true
        },
        rank: [
            {
                name: 'Lumber Mill',
                svg: 'lumbermill',
                require: { minerals: 2, knowledge: 5 },
                description: 'Workers assgined to the Lumber Mill will automatically harvest lumber.',
                foreman: true,
                manager: true,
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
            var harvest = Math.ceil(workers * biomes[town.biome].lumber);
            if (harvest > town.storage_cap - sum) {
                harvest = town.storage_cap - sum;
            }
            if (town.quota['lumber'] && harvest > town.quota['lumber'] - town['storage']['lumber']) {
                if (town[building]['manager'] && town['trading_post'] && town['trading_post']['workers']) {
                    var excess = harvest - (town.quota['lumber'] - town['storage']['lumber']);
                    global.money += excess * global.resource.lumber.value;
                }
                harvest = town.quota['lumber'] - town['storage']['lumber'];
            }
            if (town['storage']['lumber']) {
                town['storage']['lumber'] += Number(harvest);
            }
            else {
                town['storage']['lumber'] = Number(harvest);
            }
        }
    };
    
    // Allows player to asign citizens as quarry workers, who automatically harvest lumber
    building['rock_quarry'] = {
        type: 'factory',
        limit: 1,
        allow: { all: true },
        rank: [
            {
                name: 'Rock Quarry',
                svg: 'rockquarry',
                require: { minerals: 2, knowledge: 5 },
                description: 'Workers assgined to the Rock Quarry will automatically mine stone.',
                foreman: true,
                manager: true,
                labor: 'quarry',
                labor_cap: 5,
                cost: { 
                    iron: 30,
                    lumber: 40
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
            if (town.quota['stone'] && workers > town.quota['stone'] - town['storage']['stone']) {
                if (town[building]['manager'] && town['trading_post'] && town['trading_post']['workers']) {
                    var excess = workers - (town.quota['stone'] - town['storage']['stone']);
                    global.money += excess * global.resource.stone.value;
                }
                workers = town.quota['stone'] - town['storage']['stone'];
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
        allow: { all: true },
        rank: [
            {
                name: 'Cement Plant',
                svg: 'cementfactory',
                require: { minerals: 2, knowledge: 5 },
                description: 'The cement plant consumes stone and produces cement.',
                foreman: true,
                manager: true,
                labor: 'factory',
                labor_cap: 5,
                cost: { 
                    money: 100,
                    iron: 50,
                    lumber: 50
                },
                effect: function (town, building) {
                    global.resource.cement.unlocked = 1;
                }
            }
        ],
        produce: function (town, building) {
            var workers = town[building].workers;
            if (workers === 0) {
                return;
            }
            var sum = Number(Object.keys(town['storage']).length ? Object.values(town['storage']).reduce((a, b) => a + b) : 0);
            if (town['storage']['stone'] < workers) {
                workers = town['storage']['stone'];
            }
            if (town.quota['cement'] && workers > town.quota['cement'] - town['storage']['cement']) {
                if (town[building]['manager'] && town['trading_post'] && town['trading_post']['workers']) {
                    var excess = workers - (town.quota['cement'] - town['storage']['cement']);
                    global.money += excess * global.resource.cement.value;
                }
                workers = town.quota['cement'] - town['storage']['cement'];
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
    
    // Used to smelt metals into useful ignots
    building['blast_furnance'] = {
        type: 'unique',
        limit: 1,
        allow: { all: false }, // doesn't currently do anything, don't make people build it for no reason 
        rank: [
            {
                name: 'Blast Furnace',
                svg: 'furnace',
                require: { smelting: 1 },
                description: 'The Blast Furnance is used to process various ores into metals.',
                cost: { 
                    stone: 5,
                    lumber: 5
                }
            }
        ]
    };
    
    // Produces steel, requires workers
    building['steel_mill'] = {
        type: 'factory',
        limit: 1,
        allow: { all: true },
        rank: [
            {
                name: 'Steel Mill',
                svg: 'steelmill',
                require: { minerals: 4, mining: 3 },
                description: 'The Steel Mill consumes iron and coal to make steel.',
                foreman: true,
                manager: true,
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
            if ( workers * 2 > town['storage']['iron'] ) {
                workers = Math.floor(town['storage']['iron'] / 2);
            }
            if ( workers > town['storage']['coal'] ) {
                workers = town['storage']['coal'];
            }
            if (town.quota['steel'] && workers > town.quota['steel'] - town['storage']['steel']) {
                if (town[building]['manager'] && town['trading_post'] && town['trading_post']['workers']) {
                    var excess = harvest - (town.quota['steel'] - town['storage']['steel']);
                    global.money += excess * global.resource.steel.value;
                }
                workers = town.quota['steel'] - town['storage']['steel'];
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
        allow: { all: false }, // this is going to be reimplimented as an upgrade for the farm
        rank: [
            {
                name: 'Green House',
                svg: 'greenhouse',
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
        allow: { all: true },
        inflation: { 
            scale: 'linear',
            amount: 0.5
        },
        rank: [
            {
                name: 'Hut',
                svg: 'hut',
                require: { housing: 1 },
                description: 'A simple hut made out of wood and stone, houses one citizen.',
                limit: 12,
                tile_limit: 12,
                cost: { 
                    stone: 8,
                    lumber: 12
                },
                effect: function (town, building) {
                    town['citizen']['max'] += 1;
                }
            },
            {
                name: 'House',
                svg: 'house',
                require: { minerals: 2, tech: 3 },
                description: 'A modern house, with all the conveniences, houses one citizen',
                tile_limit: 12,
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
        allow: { all: true },
        inflation: { 
            scale: 'linear',
            amount: 0.5
        },
        rank: [
            {
                name: 'Apartment Building',
                svg: 'apartments',
                require: { housing: 2, minerals: 4, tech: 3 },
                description: 'An apartment building, houses 5 citizens',
                tile_limit: 4,
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
        allow: { all: true },
        inflation: { 
            scale: 'linear',
            amount: 0.5
        },
        rank: [
            {
                name: 'Storage Shed',
                svg: 'shed',
                require: { minerals: 2, warehouse: 1 },
                description: function(){ 
                    return global['packing'] >= 1 
                        ? 'A simple shed to store resources, increases city storage limit by 25.' 
                        : 'A simple shed to store resources, increases city storage limit by 20.'; 
                }(),
                limit: 12,
                tile_limit: 12,
                cost: { 
                    stone: 6,
                    lumber: 6,
                    iron: 2
                },
                effect: function (town, building) {
                    if (global['packing'] >= 1) {
                        town['storage_cap'] += 25;
                    }
                    else {
                        town['storage_cap'] += 20;
                    }
                }
            },
            {
                name: 'Storage Shed',
                svg: 'shed',
                require: { minerals: 2, warehouse: 1, tech: 3 },
                description: function(){ 
                    return global['packing'] >= 1 
                        ? 'A simple shed to store resources, increases city storage limit by 25.' 
                        : 'A simple shed to store resources, increases city storage limit by 20.'; 
                }(),
                tile_limit: 12,
                cost: { 
                    money: 75,
                    cement: 4,
                    lumber: 8,
                    copper: 2,
                    iron: 2
                },
                effect: function (town, building) {
                    if (global['packing'] >= 1) {
                        town['storage_cap'] += 25;
                    }
                    else {
                        town['storage_cap'] += 20;
                    }
                }
            }
        ]
    };
    
    building['warehouse'] = {
        type: 'storage',
        allow: { all: true },
        inflation: { 
            scale: 'linear',
            amount: 0.5
        },
        rank: [
            {
                name: 'Warehouse',
                svg: 'warehouse',
                require: { minerals: 2, warehouse: 2, tech: 3 },
                description: function(){ 
                    return global['packing'] >= 2 
                        ? 'A large storage building, increases city storage limit by 125.' 
                        : 'A large storage building, increases city storage limit by 100.'; 
                }(),
                tile_limit: 4,
                cost: { 
                    money: 500,
                    cement: 40,
                    lumber: 50,
                    copper: 20,
                    steel: 30
                },
                effect: function (town, building) {
                    if (global['packing'] >= 2) {
                        town['storage_cap'] += 125;
                    }
                    else {
                        town['storage_cap'] += 100;
                    }
                }
            }
        ]
    };
    
    building['university'] = {
        type: 'unique',
        limit: 1,
        allow: { all: true },
        rank: [
            {
                name: 'University',
                svg: 'university',
                require: { education: 1 },
                description: 'Allows citizens to educate themselves and staff jobs which require specialized knowledge.',
                staff: true,
                labor: 'professor',
                labor_cap: 2,
                cost: { 
                    money: 1000,
                    lumber: 100,
                    cement: 100,
                    steel: 50,
                    copper: 50
                }
            }
        ]
    };
}
