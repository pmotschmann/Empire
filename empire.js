$(function() {    
    defineResources();
    defineTech();
    defineBuildings();
    
    resources.lumber.unlocked = 1;
    resources.stone.unlocked = 1;
    
    // Set current research
    loadTech();
        
    // Load unlocked resources
    Object.keys(resources).forEach(function (key) { 
        if (resources[key].unlocked) {
            createResourceBind(resources,key);
        }
    });
    
    // Load city progression
    loadCity();
    
    // Main game loop
    setInterval(function() {
        for (var id=0; id < city.length; id++) {
            // Resource mining
            // Uses weird reverse loop so depleted mines can be pruned
            for (var key=city[id]['mine'].length - 1; key >= 0; key--) {
                var mine = city[id]['mine'][key];
                var remain = building['mine'].produce(mine);
                
                // Mine is depleted
                if (Object.values(mine['resources']).reduce((a, b) => a + b) === 0) {
                    city[id]['citizen']['idle'] += mine['workers'];
                    $('#' + mine['id']).remove();
                    Object.keys(mine['resources']).forEach(function (res) {
                        unwatch[mine['id'] + res]();
                        delete unwatch[mine['id'] + res];
                    });
                    unwatch[mine['id'] + 'workers']();
                    delete unwatch[mine['id'] + 'workers'];
                    city[id]['mine'].splice(key, 1);
                }
            }
            // Triggers production
            Object.keys(building).forEach(function (bld) {
                if (building[bld].type === 'mine') {
                    return;
                }
                else if (city[id][bld] && building[bld].produce) {
                    building[bld].produce(city[id],bld);
                }
            });
            
            // Calculates citizen growth
            if (city[id].citizen.max > city[id].citizen.amount) {
                var num = (city[id].citizen.amount * 25) / biomes[city[id].biome].growth;
                var farmers = 1;
                if (city[id].farm) {
                    farmers += city[id].farm.workers;
                }
                if (Math.random() * num < farmers) {
                    city[id].citizen.amount++;
                }
            }
            
        }
        save.setItem('city',JSON.stringify(city));
    }, 1000);
});
    
function showTech(techKey,techLevel) {
    var tech = $('<div id="' + techKey + 'Clicker" class="tech" title="Research ' + nameCase(research[techKey][techLevel]['name']) +'"></div>');
    var name = $('<div class="name">' + research[techKey][techLevel]['name'] + '</div>');
    var desc = $('<div class="desc">' + research[techKey][techLevel]['description'] + '</div>');
    tech.append(name);
    tech.append(desc);
    Object.keys(research[techKey][techLevel]['cost']).forEach(function (cost) { 
        var res = $('<span class="resource">' + nameCase(cost) + '</span>');
        var price = $('<span class="cost">' + research[techKey][techLevel]['cost'][cost] + '</span>');
        tech.append(res);
        tech.append(price);
    });
    var name = $('<div class="footer"></div>');
    tech.append(name);
    $('#research div').first().append(tech);
    
    $('#' + techKey + 'Clicker').on('click',function(e){
        e.preventDefault();
        
        var paid = true;
        Object.keys(research[techKey][techLevel]['cost']).forEach(function (cost) {
            if (Number(save.getItem(cost)) < research[techKey][techLevel]['cost'][cost]) {
                paid = false;
                return;
            }
        });
        if (paid) {
            Object.keys(research[techKey][techLevel]['cost']).forEach(function (cost) {
                resources[cost]['amount'] -= research[techKey][techLevel]['cost'][cost];
            });
            save.setItem(techKey,Number(save.getItem(techKey)+1));
            save.setItem('knowledge',Number(save.getItem('knowledge')) + 1);
            if (research[techKey][techLevel]['effect']) {
                research[techKey][techLevel]['effect']();
            }
            loadTech();
            for (var i=0; i < city.length; i++) {
                loadCityCore(i);
            }
        }
        
        return false;
    });
}

function loadTech() {
    // Load Research Listing
    $('#research div').first().empty();
    Object.keys(research).forEach(function (key) { 
        var techLevel = Number(save.getItem(key)) || 0;
        if ( research[key][techLevel] ) {
            if (research[key][techLevel].require) {
                if (checkRequirements(research[key][techLevel].require)) {
                    showTech(key,techLevel);
                }
            }
            else {
                showTech(key,techLevel);
            }
        }
    });
}

function checkRequirements(requirements) {
    var available = true;
    Object.keys(requirements).forEach(function (req) {
        var testTech = Number(save.getItem(req)) || 0;
        if (testTech < Number(requirements[req])) {
            available = false;
            return false;
        }
    });
    return available;
}

function nameCase(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
