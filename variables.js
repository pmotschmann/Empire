var save = window.localStorage;
var unwatch = {};
var vue = {};
var intervals = {};
var resources = {};
var building = {};
var research = {};
var city = [{
    storage: {},
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
    capital: {
        name: 'grassland',
        desc: 'Grasslands are temparte climates dominated by large fields of grass, they make favorable farmland and are easy to develop settlements in.',
        cost: 1.0,
        growth: 1.0,
        lumber: 1.0,
        stone: 1.0,
        minerals: {
            copper: 0.65,
            iron: 0.7,
            coal: 0.4
        },
        explore: false,
        tile_color: '#59ae69'
    },
    grassland: {
        desc: 'Grasslands are temparte climates dominated by large fields of grass, they make favorable farmland and are easy to develop settlements in.',
        cost: 1.0,
        growth: 1.2,
        lumber: 1.0,
        stone: 1.0,
        minerals: {
            copper: 0.65,
            iron: 0.7,
            coal: 0.4,
            aluminium: 0.3,
            gold: 0.1
        },
        explore: true,
        tile_color: '#59ae69'
    },
    desert: {
        desc: 'Deserts are arid climents that can be hard to settle and lack access to timber, they are however excellent sources of stone, oil, and rare metals.',
        cost: 1.2,
        growth: 0.5,
        stone: 2.0,
        minerals: {
            copper: 0.9,
            iron: 1.0,
            coal: 0.5,
            gold: 0.3,
            aluminium: 0.3,
            titanium: 0.2
        },
        oil: 0.5,
        explore: true,
        tile_color: '#59ae69'
    },
    mountain: {
        desc: 'Mountain areas are often rich with mineral resources, but are tough to colonize. Mountain settlements however are generally easy to foriify.',
        cost: 1.2,
        growth: 0.75,
        lumber: 0.5,
        stone: 1.0,
        minerals: {
            copper: 1.0,
            iron: 1.25,
            coal: 0.85,
            gold: 0.2,
            aluminium: 0.5,
            titanium: 0.3
        },
        oil: 0.05,
        explore: true,
        tile_color: '#59ae69'
    },
    forest: {
        desc: 'Forests are rich in lumber but generally are poor sources of other resources.',
        cost: 1.0,
        growth: 1.0,
        lumber: 2.5,
        stone: 0.5,
        minerals: {
            copper: 0.25,
            iron: 0.3,
            coal: 0.25,
            aluminium: 0.15,
            gold: 0.1
        },
        explore: true,
        tile_color: '#59ae69'
    },
    wetland: {
        desc: 'Wetlands are often treacherous terrain that are poorly suited for settlements, the conditions make it hard to extact minerals from the earth and are genrally tough to live in. However wetlands are tough to invade so they make great strongholds.',
        cost: 1.5,
        growth: 0.5,
        lumber: 0.8,
        stone: 0.25,
        minerals: {
            copper: 0.25,
            iron: 0.15,
            coal: 0.15,
            gold: 0.1,
            aluminium: 0.2,
            titanium: 0.15
        },
        explore: true,
        tile_color: '#59ae69'
    }
};

var jobs = {
    miner: { 
        title: 'Miners',
        desc: 'Miners are workers who extract ore from the ground.',
        tax: 1,
        skilled: false
    },
    trader: { 
        title: 'Trademaster',
        desc: 'The trademaster allows resources to be sold for profit.',
        tax: 3,
        skilled: false
    },
    farmer: { 
        title: 'Farmers',
        desc: 'Farmers increase the rate as which new citizens fill empty housing.',
        tax: 1,
        skilled: false
    },
    miller: { 
        title: 'Mill Workers',
        desc: 'Mill workers are a type of factory worker. They produce resources and sometimes consume other resources depending on the type of building.',
        tax: 1,
        skilled: false
    },
    quarry: { 
        title: 'Quarry Workers',
        desc: 'Quarry workers mine stone from rock quarries.',
        tax: 1,
        skilled: false
    },
    factory: { 
        title: 'Plant Workers',
        desc: 'Plant workers are a type of factory worker. They produce resources and sometimes consume other resources depending on the type of building.',
        tax: 1,
        skilled: false
    },
    foreman: { 
        title: 'Foreman',
        desc: 'The foreman increases the productivity of a factory. Each factory worker is more efficent when a foreman is present.',
        tax: 2,
        skilled: false
    },
    manager: { 
        title: 'Manager',
        desc: 'The manager will automatically arrange the sale of all excess materials produced by this facility.',
        tax: 3,
        skilled: false
    },
    bureaucrat: { 
        title: 'Bureaucrats',
        desc: 'Bureaucrats process red tape for your citizens. Their job function is unclear but they sure do generate a lot of mysterious revenue.',
        tax: 5,
        skilled: false
    },
    professor: { 
        title: 'Professors',
        desc: 'Professors train your citizens in higher education allowing them to hold jobs which require specialized skills.',
        tax: 3,
        skilled: true,
        train: 60
    },
    accountant: { 
        title: 'Accountant',
        desc: 'The accountant keeps track of your workforce in a ledger so you can more easily manage your assets.',
        tax: 8,
        skilled: true,
        train: 300
    }
};
