function loadCity() {
    /*city['citizen'] = { 
        total: Number(save.getItem('citizen') || 0,
        free: Number(save.getItem('citizen') || 0,
    };*/
    city['copper_mine'] = { 
        rank: Number(save.getItem('copper_mine') || 0, 
        workers: Number(save.getItem('copper_mine_workers') || 0
    };
    city['iron_mine'] = Number(save.getItem('iron_mine') || 0;
    city['coal_mine'] = Number(save.getItem('coal_mine') || 0;
    city['steel_mill'] = Number(save.getItem('steel_mill') || 0;
        
    Object.keys(city).forEach(function (key) { 
        if (building[key]['type'] === 'factory')
            new Vue({
                data: city[key]
            }).$watch('workers', function (newValue, oldValue) {
                save.setItem(key + '_workers',city[key]['workers']);
            });
        );
    });
}

function defineBuildings() {
    
    building['stone_mine'] = {
        type: 'factory',
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
                },
                production: function () {
                    
                }
            }
        ]
    };
    
    new Vue({
        data: building[stone_mine]
    });
    
    building['copper_mine'] = [
        {
            name: 'Copper Mine',
            require: { mining: 1 },
            description: 'Construct a Copper Mine',
            cost: { 
                lumber: 25
            },
            effect: function () {
                save.setItem('copperUnlocked',1);
            }
        }
    ];
    
    building['iron_mine'] = [
        {
            name: 'Iron Mine',
            description: 'Construct an Iron Mine',
            cost: { 
                lumber: 250
            },
            effect: function () {
                save.setItem('ironUnlocked',1);
            }
        }
    ];
    
    building['coal_mine'] = [
        {
            name: 'Coal Mine',
            description: 'Construct a Coal Mine',
            cost: { 
                lumber: 1000
            },
            effect: function () {
                save.setItem('coalUnlocked',1);
            }
        }
    ];
    
    building['steel_mill'] = [
        {
            name: 'Steel Mill',
            description: 'Construct a Steel Mill',
            cost: { 
                coal: 250,
                iron: 250,
                lumber: 1000,
            },
            effect: function () {
                save.setItem('steelUnlocked',1);
            }
        }
    ];
}
