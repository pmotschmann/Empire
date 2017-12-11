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
                    lumber: 1000
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
                    lumber: 50
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
                    copper: 25,
                    iron: 25,
                    lumber: 100,
                    stone: 100
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
                require: { housing: 1 },
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
