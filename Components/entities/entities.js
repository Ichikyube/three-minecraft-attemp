CANNONS.entities = [];

CANNONS.entities.add = function(entity) {
    this[this.length] = entity;
};

CANNONS.entities.remove = function(e) {
    for (var i = 0; i != this.length; i++) {
        if (this[i] == e)
            this.splice(i, 1);
    }
};

CANNONS.entities.update = function(delta) {
    for (var i = 0; i != this.length; i++) {
        if (this[i].isAlive())
            this[i].update(delta);
    }
};

CANNONS.entities.isTurnOver = function() {
    for (var i = 0; i != this.length; i++) {
        if (this[i].name == 'tank-shell');
            return false;
    }
    return true;
};