function defineTech() {
    
    // General Technological Level of the Empire
    research['tech'] = [ 
        {
            name: 'Simple Handtools',
            description: 'Knowledge of how to construct simple hand tools',
            cost: { 
                lumber: 2,
                stone: 2
            }
        },
        {
            name: 'Electricity',
            require: { copperUnlocked: 1, knowledge: 6 },
            description: 'Discover electricity and advance into a new era',
            cost: { 
                copper: 25,
                coal: 25
            }
        },
        {
            name: 'Power Tools',
            require: { mining: 5, timber: 5 },
            description: 'Modern tools powered by electricity',
            cost: { 
                coal: 500,
                oil: 500,
                steel: 500
            }
        }
    ];
    
    research['housing'] = [
        {
            name: 'Basic Housing',
            require: { tech: 1, knowledge: 3 },
            description: 'Learn how to build simple houses for citizens',
            cost: { 
                lumber: 5,
                stone: 5
            }
        }
    ];
    
    research['farming'] = [
        {
            name: 'Farming',
            require: { housing: 1 },
            description: 'Learn the basics of farming',
            cost: { 
                lumber: 10,
                stone: 20
            }
        },
        {
            name: 'Greenhouse',
            require: { knowledge: 20 },
            description: 'Learn about how a greenhouse can enhance your farm',
            cost: { 
                lumber: 10,
                stone: 5,
                iron: 5
            }
        }
    ];
    
    research['minerals'] = [
        {
            name: 'Copper Ore',
            require: { knowledge: 2 },
            description: 'Learn how to extract and smelt copper ore',
            cost: { 
                lumber: 10,
                stone: 10
            },
            effect: function () {
                global.resource.copper.unlocked = 1;
            }
        },
        {
            name: 'Iron Ore',
            require: { knowledge: 4 },
            description: 'Learn how to extract and smelt iron ore',
            cost: { 
                lumber: 10,
                stone: 10,
                copper: 10
            },
            effect: function () {
                global.resource.iron.unlocked = 1;
            }
        },
        {
            name: 'Coal Ore',
            require: { knowledge: 6 },
            description: 'Learn how to extract coal ore',
            cost: { 
                lumber: 10,
                stone: 10,
                iron: 10
            },
            effect: function () {
                global.resource.coal.unlocked = 1;
            }
        },
        {
            name: 'Steel Smelting',
            require: { knowledge: 6 },
            description: 'Learn how to turn iron and coal into steel',
            cost: { 
                lumber: 10,
                coal: 10,
                iron: 25
            },
            effect: function () {
                global.resource.steel.unlocked = 1;
            }
        }
    ];
    
    // General technology related to mining
    research['mining'] = [
        {
            name: 'Stone Pickaxe',
            require: { tech: 1 },
            description: 'A crude pickaxe made from a stone head attached to a stick. Increases manual mining speed.',
            cost: { 
                lumber: 2,
                stone: 2
            },
            effect: function () {
                global.resource.stone.rate = 2;
            }
        },
        {
            name: 'Copper Pickaxe',
            description: 'A pickaxe made from a wooden shaft with a copper head. Increases manual mining speed.',
            cost: { 
                lumber: 5,
                copper: 5
            },
            effect: function () {
                global.resource.stone.rate = 3;
                global.resource.copper.rate = 2;
            }
        },
        {
            name: 'Iron Pickaxe',
            description: 'A pickaxe made from a wooden shaft with an iron head. Increases manual mining speed.',
            cost: { 
                lumber: 10,
                iron: 10
            },
            effect: function () {
                global.resource.stone.rate = 4;
                global.resource.copper.rate = 3;
                global.resource.iron.rate = 2;
                global.resource.coal.rate = 2;
            }
        },
        {
            name: 'Steel Pickaxe',
            description: 'A pickaxe made from a wooden shaft with a steel head. Increases manual mining speed.',
            cost: { 
                lumber: 100,
                steel: 25
            },
            effect: function () {
                global.resource.stone.rate = 5;
                global.resource.copper.rate = 4;
                global.resource.iron.rate = 3;
                global.resource.coal.rate = 3;
            }
        },
        {
            name: 'Lightweight Pickaxe',
            description: 'A pickaxe made from an aluminium shaft with a steel head. Increases manual mining speed.',
            cost: { 
                lumber: 250,
                aluminium: 100
            },
            effect: function () {
                global.resource.stone.rate = 6;
                global.resource.copper.rate = 5;
                global.resource.iron.rate = 4;
                global.resource.coal.rate = 4;
            }
        }
    ];
    
    // Lumberjacking tech
    research['timber'] = [
        {
            name: 'Stone Axe',
            require: { tech: 1 },
            description: 'A crude axe made from a stone head attached to a stick. Increases manual wood cutting speed.',
            cost: { 
                lumber: 2,
                stone: 2
            },
            effect: function () {
                global.resource.lumber.rate = 2;
            }
        },
        {
            name: 'Copper Axe',
            description: 'An axe made from a wooden shaft with a copper head. Increases manual wood cutting speed.',
            cost: { 
                lumber: 5,
                copper: 5
            },
            effect: function () {
                global.resource.lumber.rate = 3;
            }
        },
        {
            name: 'Iron Axe',
            description: 'An axe made from a wooden shaft with a copper head. Increases manual wood cutting speed.',
            cost: { 
                lumber: 10,
                iron: 10
            },
            effect: function () {
                global.resource.lumber.rate = 4;
            }
        },
        {
            name: 'Steel Axe',
            description: 'An axe made from a wooden shaft with a copper head. Increases manual wood cutting speed.',
            cost: { 
                lumber: 100,
                steel: 25
            },
            effect: function () {
                global.resource.lumber.rate = 5;
            }
        },
        {
            name: 'Crosscut Saw',
            description: 'The next evolution in cutting down trees, saws are more efficent then axes. Increases manual wood cutting speed.',
            cost: { 
                lumber: 250,
                steel: 100
            },
            effect: function () {
                global.resource.lumber.rate = 6;
            }
        },
        {
            name: 'Bow Saw',
            description: 'A better saw with an aluminium frame. Increases manual wood cutting speed.',
            cost: { 
                aluminium: 2500,
                steel: 5000
            },
            effect: function () {
                global.resource.lumber.rate = 7;
            }
        },
        {
            name: 'Chainsaw',
            require: { tech: 2 },
            description: 'A lean mean tree cutting machine, chainsaws are way better then manual saws. Increased manual lumber yield.',
            cost: { 
                oil: 2500,
                aluminium: 5000,
                steel: 25000
            },
            effect: function () {
                global.resource.lumber.yield = 2;
            }
        }
    ];
}
