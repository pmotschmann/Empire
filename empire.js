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
    
    // main game loop
    setInterval(function() {
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
