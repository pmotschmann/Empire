// Sets up resource definitions
function defineResources() {
    loadResource('lumber',1,1,1);
    loadResource('stone',1,1,1);
    loadResource('copper',1,0,2);
    loadResource('iron',1,0,2);
    loadResource('coal',1,0,2);
    loadResource('steel',0,0,5);
    loadResource('cement',0,0,2);
    loadResource('aluminium',0,0,4);
    loadResource('gold',0,0,10);
    loadResource('titanium',0,0,5);
    loadResource('oil',0,0,10);
}

// Load resource function
// This function defines each resource, loads saved values from localStorage
// And it creates Vue binds for various resource values
function loadResource(name,manual,open,value) {
    global['resource'][name] = {
        manual: manual,
        unlocked: open,
        rate: 1,
        yield: 1,
        value: value
    };
}
