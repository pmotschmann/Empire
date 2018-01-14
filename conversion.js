// Upgrade from pre-SVG to post-svg
function upgrade_save() {
    town = city[0];
    town['map'] = generateMap('grassland',10);
    town['scale'] = 50;
    town['size'] = 2;
    town['mine'] = []; // too complicated, user will just have to prospect more
    if (town['city_hall']) {
        town['map'][0][0][0] = [{  
            type: 'city_hall',
            svg: building['city_hall'].rank[1].svg,
            x: 0,
            y: 0
        }];
        town['city_hall']['rank'] = 1;
    }
    else {
        town['map'][0][0][0] = [{  
            type: 'city_hall',
            svg: building['city_hall'].rank[0].svg,
            x: 0,
            y: 0
        }];
        town['city_hall']['rank'] = 0;
    }
    if (town['cement_plant']) {
        town['map'][1][-1][0] = [{  
            type: 'cement_plant',
            svg: building['cement_plant'].rank[0].svg,
            x: 0,
            y: 0
        }];
    }
    if (town['lumber_mill']) {
        town['map'][-1][1][0] = [{  
            type: 'lumber_mill',
            svg: building['lumber_mill'].rank[0].svg,
            x: 0,
            y: 0
        }];
    }
    if (town['rock_quarry']) {
        town['map'][-1][0][1] = [{  
            type: 'rock_quarry',
            svg: building['rock_quarry'].rank[0].svg,
            x: 0,
            y: 0
        }];
    }
    if (town['trading_post']) {
        town['map'][1][0][-1] = [{  
            type: 'trading_post',
            svg: building['trading_post'].rank[0].svg,
            x: 0,
            y: 0
        }];
    }
    if (town['steel_mill']) {
        town['map'][0][1][-1] = [{  
            type: 'steel_mill',
            svg: building['steel_mill'].rank[0].svg,
            x: 0,
            y: 0
        }];
    }
    if (town['farm']) {
        town['map'][0][-1][1] = [{  
            type: 'farm',
            svg: building['farm'].rank[0].svg,
            x: 0,
            y: 0
        }];
    }
    if (town['small_house']) {
        if (town['small_house'].owned > 12) {
            town['small_house'].owned = 12; //sucks for you
        }
        town['map'][2][0][-2] = [];
        for (var i=0; i<town['small_house'].owned; i++) {
            var coords = offsets(town, 'small_house', town['small_house'].rank, i);
            town['map'][2][0][-2].push({
                type: 'small_house',
                svg: building['small_house'].rank[town['small_house'].rank].svg,
                x: coords.x,
                y: coords.y
            });
        }
    }
    if (town['shed']) {
        if (town['shed'].owned > 12) {
            town['shed'].owned = 12; //sucks for you
        }
        town['map'][-2][0][2] = [];
        for (var i=0; i<town['shed'].owned; i++) {
            var coords = offsets(town, 'shed', town['shed'].rank, i);
            town['map'][-2][0][2].push({
                type: 'shed',
                svg: building['shed'].rank[town['shed'].rank].svg,
                x: coords.x,
                y: coords.y
            });
        }
    }
    if (town['medium_house']) {
        if (town['medium_house'].owned > 4) {
            town['medium_house'].owned = 4; //sucks for you
        }
        town['map'][-1][-1][2] = [];
        for (var i=0; i<town['medium_house'].owned; i++) {
            var coords = offsets(town, 'medium_house', town['medium_house'].rank, i);
            town['map'][-1][-1][2].push({
                type: 'medium_house',
                svg: building['medium_house'].rank[town['medium_house'].rank].svg,
                x: coords.x,
                y: coords.y
            });
        }
    }
    if (town['warehouse']) {
        if (town['warehouse'].owned > 4) {
            town['warehouse'].owned = 4; //sucks for you
        }
        town['map'][1][1][-2] = [];
        for (var i=0; i<town['warehouse'].owned; i++) {
            var coords = offsets(town, 'warehouse', town['warehouse'].rank, i);
            town['map'][1][1][-2].push({
                type: 'warehouse',
                svg: building['warehouse'].rank[town['warehouse'].rank].svg,
                x: coords.x,
                y: coords.y
            });
        }
    }
}
