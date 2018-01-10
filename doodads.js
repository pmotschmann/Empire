function calcDebris(types, min, max) {
    var stack = [];
    var bound = Math.rand(min, max);
    for (i=0; i<bound; i++) {
        var varianceY = Math.rand(-34,34);
        stack.push(varianceY);
    }
    stack = stack.sort(function (a, b) { return a - b; });
    var objects = [];
    for (var i=0; i<stack.length; i++) {
        var cap = (Math.abs(stack[i]) > 16 ? Math.abs(stack[i]) - 16 : 0) * 2; 
        var varianceX = Math.rand((-34 + cap),(34 - cap));
        
        objects.push({
            type: 'debris',
            svg: types[Math.rand(0,types.length)],
            x: varianceX,
            y: stack[i]
        });
    }
    
    return objects;
}
