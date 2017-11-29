var research = {
    tech: [ // General Technological Level of the Empire
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
    ],
    resource: [
        {
            name: 'Copper Mine',
            require: { mining: 1 },
            description: 'Construct a Copper Mine',
            cost: { 
                lumber: 25
            },
            effect: function (){
                resources['copper'].unlocked = 1;
                save.setItem('copperUnlocked',1);
                createResourceBind(resources,'copper');
            }
        },
        {
            name: 'Iron Mine',
            description: 'Construct an Iron Mine',
            cost: { 
                lumber: 250
            },
            effect: function (){
                resources['iron'].unlocked = 1;
                save.setItem('ironUnlocked',1);
                createResourceBind(resources,'iron');
            }
        },
        {
            name: 'Coal Mine',
            description: 'Construct a Coal Mine',
            cost: { 
                lumber: 1000
            },
            effect: function (){
                resources['coal'].unlocked = 1;
                save.setItem('coalUnlocked',1);
                createResourceBind(resources,'coal');
            }
        },
        {
            name: 'Steel Mill',
            description: 'Construct a Steel Mill',
            cost: { 
                coal: 250,
                iron: 250,
                lumber: 1000,
            },
            effect: function (){
                resources['steel'].unlocked = 1;
                save.setItem('steelUnlocked',1);
                createResourceBind(resources,'steel');
            }
        }
    ],
    mining: [
        {
            name: 'Stone Pickaxe',
            require: { tech: 1 },
            description: 'A crude pickaxe made from a stone head attached to a stick',
            cost: { 
                lumber: 10,
                stone: 10
            },
            effect: function (){
                resources['stone'].rate = 2;
                save.setItem('stoneRate',2);
            }
        },
        {
            name: 'Copper Pickaxe',
            description: 'A pickaxe made from a wooden shaft with a copper head',
            cost: { 
                lumber: 25,
                copper: 25
            },
            effect: function (){
                resources['stone'].rate = 3;
                save.setItem('stoneRate',3);
            }
        },
        {
            name: 'Iron Pickaxe',
            description: 'A pickaxe made from a wooden shaft with an iron head',
            cost: { 
                lumber: 250,
                iron: 100
            },
            effect: function (){
                resources['stone'].rate = 4;
                save.setItem('stoneRate',4);
            }
        },
        {
            name: 'Steel Pickaxe',
            description: 'A pickaxe made from a wooden shaft with a steel head',
            cost: { 
                lumber: 1000,
                steel: 100
            },
            effect: function (){
                resources['stone'].rate = 5;
                save.setItem('stoneRate',5);
            }
        },
        {
            name: 'Lightweight Pickaxe',
            description: 'A pickaxe made from an aluminium shaft with a steel head',
            cost: { 
                lumber: 2500,
                aluminium: 250
            }
        }
    ],
    timber: [
        {
            name: 'Stone Axe',
            require: { tech: 1 },
            description: 'A crude axe made from a stone head attached to a stick',
            cost: { 
                lumber: 10,
                stone: 10
            },
            effect: function (){
                resources['lumber'].rate = 2;
                save.setItem('lumberRate',2);
            }
        },
        {
            name: 'Copper Axe',
            description: 'An axe made from a wooden shaft with a copper head',
            cost: { 
                lumber: 25,
                copper: 25
            },
            effect: function (){
                resources['lumber'].rate = 3;
                save.setItem('lumberRate',3);
            }
        },
        {
            name: 'Iron Axe',
            description: 'An axe made from a wooden shaft with a copper head',
            cost: { 
                lumber: 250,
                iron: 100
            },
            effect: function (){
                resources['lumber'].rate = 4;
                save.setItem('lumberRate',4);
            }
        },
        {
            name: 'Steel Axe',
            description: 'An axe made from a wooden shaft with a copper head',
            cost: { 
                lumber: 1000,
                steel: 100
            },
            effect: function (){
                resources['lumber'].rate = 5;
                save.setItem('lumberRate',5);
            }
        },
        {
            name: 'Crosscut Saw',
            description: 'The next evolution in cutting down trees, saws are more efficent then axes',
            cost: { 
                lumber: 2500,
                steel: 250
            }
        },
        {
            name: 'Bow Saw',
            description: 'A better saw with an aluminium frame',
            cost: { 
                aluminium: 2500,
                steel: 5000
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
            }
        }
    ]
};
