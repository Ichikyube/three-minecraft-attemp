CANNONS.Land = function(width, length, height) {

    console.log('building land: ', width, length, height);

    this.width = width;
    this.length = length;
    this.height = height;

    this.data = [];

    this.set = function(x, y, z, val) {
        this.data[y][z * this.width + x] = val;
    };

    this.get = function(x, y, z) {
        return this.data[y][z * this.width + x];
    };

    this.getY = function(x, z) {
        for (var i = 0; i != this.height; i++)
            if (this.get(x, i, z) == 0)
                return i;
    };

    this.init = function() {
        for (var i = 0; i != this.height; i++) {
            this.data[i] = Array.apply(null, new Array(this.width * this.length))
                .map(Number.prototype.valueOf, 0);
        }
    };

    this.setData = function(noise) {
        for (var y = 0; y != this.height; y++)
            for (var z = 0; z != this.length; z++)
                for (var x = 0; x != this.width; x++) {
                    var val = (noise[x + z * this.width] * 0.2) | 0;
                    if (val > y)
                        this.set(x, y, z, 1);
                }
        console.log(this.data);
    };

    this.init();
};