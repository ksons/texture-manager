module.exports = function () {

    if (!Array.prototype.find) {
        Array.prototype.find = function (predicate) {
            if (this == null) {
                throw new TypeError('Array.prototype.find called on null or undefined');
            }
            if (typeof predicate !== 'function') {
                throw new TypeError('predicate must be a function');
            }
            var list = Object(this);
            var length = list.length >>> 0;
            var thisArg = arguments[1];
            var value;

            for (var i = 0; i < length; i++) {
                value = list[i];
                if (predicate.call(thisArg, value, i, list)) {
                    return value;
                }
            }
            return undefined;
        };
    }

    var SimpleTextureManager = function (opt) {
        opt = opt || {};
        this._units = [];
        for (var i = 0; i < (opt.units || 8); i++) {
            this._units[i] = {slot: i, use: 0};
        }
    };

    SimpleTextureManager.NOT_FOUND = -1;
    SimpleTextureManager.FULL = -2;

    SimpleTextureManager.prototype = {

        _set: function (slot, newEntry) {
            var oldEntry = this._units[slot];
            if (oldEntry.dispose) {
                oldEntry.dispose(oldEntry, this);
            }
            if (newEntry) {
                this._units[slot] = newEntry;
                this._units[slot].slot = slot;
            } else {
                this._units[slot] = {slot: slot, use: 0};
            }
        },

        bind: function (id, opt) {
            opt = opt || {};
            var fixed = !!opt.fixed;
            var dispose = typeof opt.dispose == "function" ? opt.dispose : null;
            var now = Date.now();

            // Check if texture is already bound
            var result = this.get(id);
            if (result !== SimpleTextureManager.NOT_FOUND) {
                return result;
            }

            var candidates = this._units.filter(function (unit) {
                return !unit.fixed;
            });
            //console.log("Candidates,", candidates, candidates.length);

            if (!candidates.length) {
                return SimpleTextureManager.FULL;
            }

            var selected = candidates.reduce(function (prev, curr) {
                return curr.use < prev.use ? curr : prev;
            }, {use: now});
            //console.log("Selected entry", selected);

            var slot = selected.slot;
            this._set(slot, {
                fixed: fixed, use: now, id: id, dispose: dispose
            });
            return slot;

        },

        dispose: function (id) {
            var entry = this.getEntry(id);
            this._set(entry.slot, null);
        },
        /**
         * Returns if the texture of the given id is bound to an unit
         * @param id
         * @returns {boolean}
         */
        has: function (id) {
            return !!this.getEntry(id);
        },
        /**
         * Returns the current texture unit for the id or SimpleTextureManager.NOT_FOUND
         * if the texture is currently not bound
         * @param id
         * @returns {*}
         */
        get: function (id) {
            var result = this.getEntry(id);
            if(result) {
                result.use = Date.now();
                return result.slot;
            }
            return SimpleTextureManager.NOT_FOUND;
        },

        use: function (id) {
            var result = this.getEntry(id);
            if(result) {
                result.use = Date.now();
            }
        },

        getEntry: function (id) {
            return this._units.find(function (entry) {
                return entry.id === id;
            });
        }

    };


    return {
        SimpleTextureManager: SimpleTextureManager
    };
}();
