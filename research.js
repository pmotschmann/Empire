function defineTech() {
    // General Technological Level of the Empire
    research['tech'] = [ 
        {
            name: 'Simple Handtools',
            description: 'Knowledge of how to construct simple hand tools',
            cost: { 
                lumber: 5,
                stone: 5
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
    
    // General technology related to mining
    research['mining'] = [
        {
            name: 'Stone Pickaxe',
            require: { tech: 1 },
            description: 'A crude pickaxe made from a stone head attached to a stick',
            cost: { 
                lumber: 10,
                stone: 10
            },
            effect: function () {
                resources['stone'].rate = 2;
            }
        },
        {
            name: 'Copper Pickaxe',
            description: 'A pickaxe made from a wooden shaft with a copper head',
            cost: { 
                lumber: 25,
                copper: 25
            },
            effect: function () {
                resources['stone'].rate = 3;
                resources['copper'].rate = 2;
            }
        },
        {
            name: 'Iron Pickaxe',
            description: 'A pickaxe made from a wooden shaft with an iron head',
            cost: { 
                lumber: 250,
                iron: 100
            },
            effect: function () {
                resources['stone'].rate = 4;
                resources['copper'].rate = 3;
                resources['iron'].rate = 2;
                resources['coal'].rate = 2;
            }
        },
        {
            name: 'Steel Pickaxe',
            description: 'A pickaxe made from a wooden shaft with a steel head',
            cost: { 
                lumber: 1000,
                steel: 100
            },
            effect: function () {
                resources['stone'].rate = 5;
                resources['copper'].rate = 4;
                resources['iron'].rate = 3;
                resources['coal'].rate = 3;
                resources['aluminium'].rate = 2;
            }
        },
        {
            name: 'Lightweight Pickaxe',
            description: 'A pickaxe made from an aluminium shaft with a steel head',
            cost: { 
                lumber: 2500,
                aluminium: 250
            },
            effect: function () {
                resources['stone'].rate = 6;
                resources['copper'].rate = 5;
                resources['iron'].rate = 4;
                resources['coal'].rate = 4;
                resources['aluminium'].rate = 3;
                resources['gold'].rate = 2;
                resources['titanium'].rate = 2;
            }
        }
    ];
    
    // Lumberjacking tech
    research['timber'] = [
        {
            name: 'Stone Axe',
            require: { tech: 1 },
            description: 'A crude axe made from a stone head attached to a stick',
            cost: { 
                lumber: 10,
                stone: 10
            },
            effect: function () {
                resources['lumber'].rate = 2;
            }
        },
        {
            name: 'Copper Axe',
            description: 'An axe made from a wooden shaft with a copper head',
            cost: { 
                lumber: 25,
                copper: 25
            },
            effect: function () {
                resources['lumber'].rate = 3;
            }
        },
        {
            name: 'Iron Axe',
            description: 'An axe made from a wooden shaft with a copper head',
            cost: { 
                lumber: 250,
                iron: 100
            },
            effect: function () {
                resources['lumber'].rate = 4;
            }
        },
        {
            name: 'Steel Axe',
            description: 'An axe made from a wooden shaft with a copper head',
            cost: { 
                lumber: 1000,
                steel: 100
            },
            effect: function () {
                resources['lumber'].rate = 5;
            }
        },
        {
            name: 'Crosscut Saw',
            description: 'The next evolution in cutting down trees, saws are more efficent then axes',
            cost: { 
                lumber: 2500,
                steel: 250
            },
            effect: function () {
                resources['lumber'].rate = 6;
            }
        },
        {
            name: 'Bow Saw',
            description: 'A better saw with an aluminium frame',
            cost: { 
                aluminium: 2500,
                steel: 5000
            },
            effect: function () {
                resources['lumber'].rate = 7;
            }
        },
        {
            name: 'Chainsaw',
            require: { tech: 2 },
            description: 'A lean mean tree cutting machine, chainsaws are way better then manual saws',
            cost: { 
                oil: 2500,
                aluminium: 5000,
                steel: 25000
            },
            effect: function () {
                resources['lumber'].yield = 2;
            }
        }
    ];
}
