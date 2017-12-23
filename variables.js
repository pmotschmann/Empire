var save = window.localStorage;
var unwatch = {};
var vue = {};
var intervals = {};
var resources = {};
var building = {};
var research = {};
var city = [{
    storage: {},
    unique: {},
    factory: {},
    mine: []
}];
var global = {
    resource: {}
};

var gatherRateTable = {
    1: 30, //3000 milliseconds
    2: 25, //2500 milliseconds
    3: 20, //2000 milliseconds
    4: 15, //1500 milliseconds
    5: 10, //1000 milliseconds
    6: 5,  // 500 milliseconds
    7: 1   // 100 milliseconds
};

var biomes = {
    grassland: {
        desc: 'Grasslands are temparte climates dominated by large fields of grass, they make favorable farmland and are easy to develop settlements in.',
        cost: 1.0,
        growth: 1.0,
        resources: {
            lumber: 1.0,
            stone: 1.0,
            copper: 0.75,
            iron: 0.5,
            coal: 0.5,
            oil: 0.1
        }
    },
    desert: {
        desc: 'Deserts are arid climents that can be hard to settle, they are often excellent sources of stone, oil, and rare metals.',
        cost: 1.2,
        growth: 0.5,
        resources: {
            lumber: 0.1,
            stone: 2.0,
            copper: 1.0,
            iron: 1.0,
            coal: 0.5,
            oil: 0.5
        }
    },
    mountain: {
        desc: 'Mountain areas are often rich with mineral resources, but are tough to colonize. Mountain settlements however are generally easy to foriify.',
        cost: 1.2,
        growth: 0.75,
        resources: {
            lumber: 0.5,
            stone: 1.0,
            copper: 0.75,
            iron: 1.0,
            coal: 1.0,
            oil: 0.05
        }
    },
    forest: {
        desc: 'Forests are rich in lumber but generally are poor sources of other resources.',
        cost: 1.0,
        growth: 1.0,
        resources: {
            lumber: 2.5,
            stone: 0.5,
            copper: 0.25,
            iron: 0.25,
            coal: 0.25,
            oil: 0.1
        }
    },
    wetland: {
        desc: 'Wetlands are often treacherous terrain that are poorly suited for settlements, the conditions make it hard to extact minerals from the earth and are genrally tough to live in. However wetlands are tough to invade so they make great strongholds.',
        cost: 1.5,
        growth: 0.5,
        resources: {
            lumber: 0.8,
            stone: 0.25,
            copper: 0.25,
            iron: 0.15,
            coal: 0.15,
            oil: 0.5
        }
    }
};

var jobs = {
    miner: { title: 'Miners', tax: 1, skilled: false },
    trader: { title: 'Trademaster', tax: 3, skilled: false },
    farmer: { title: 'Farmers', tax: 1, skilled: false },
    miller: { title: 'Mill Workers', tax: 1, skilled: false },
    quarry: { title: 'Quarry Workers', tax: 1, skilled: false },
    factory: { title: 'Plant Workers', tax: 1, skilled: false },
    foreman: { title: 'Foreman', tax: 2, skilled: false }
};
