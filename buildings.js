var build = {
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
};
