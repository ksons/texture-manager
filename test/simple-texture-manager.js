var should = require('should');
var now = require('performance-now');
var SimpleTextureManager = require("..").SimpleTextureManager;

describe("Simple Texture Manager", function () {
    beforeEach(function () {
        this.tm = new SimpleTextureManager({units: 3});
    });

    describe("#constructor", function () {
        it("set defaults right", function () {
            var tm = new SimpleTextureManager();
            tm._units.length.should.be.exactly(8);
        });
        it("set optional parameters", function () {
            var tm = new SimpleTextureManager({units: 10});
            tm._units.length.should.be.exactly(10);
        });
    });

    describe("#bind", function () {
        it("should store and get entry", function () {
            var slot, entry, start = now();
            var tm = this.tm;

            slot = tm.bind(1);
            should(slot).equal(0);
            entry = tm.getEntry(1);
            entry.should.have.property("id", 1);
            entry.should.have.property("fixed", false);
            entry.should.have.property("slot", slot);
            entry.should.have.property("use").greaterThan(start);

            slot = tm.bind(2, {fixed: true});
            should(slot).equal(1);

            entry = tm.getEntry(2);
            entry.should.have.property("id", 2);
            entry.should.have.property("fixed", true);
            entry.should.have.property("slot", slot);
            entry.should.have.property("use").greaterThan(start);

            slot = tm.bind(2, {fixed: true});
            should(slot).equal(1);

            entry = tm.getEntry(2);
            entry.should.have.property("id", 2);
            entry.should.have.property("fixed", true);
            entry.should.have.property("slot", slot);
            entry.should.have.property("use").greaterThan(start);

            slot = tm.bind(3, {fixed: true});
            should(slot).equal(2);

            entry = tm.getEntry(3);
            entry.should.have.property("id", 3);
            entry.should.have.property("fixed", true);
            entry.should.have.property("slot", slot);
            entry.should.have.property("use").greaterThan(start);
        });

        it("should report when full", function () {
            var tm = this.tm;
            for (var i = 0; i < 3; i++) {
                tm.bind(i, {fixed: true});
            }
            var slot = tm.bind(4);
            should(slot).equal(SimpleTextureManager.FULL);
        });

        it("should dispose LRU", function (done) {
            var tm = this.tm;
            for (var i = 0; i < 3; i++) {
                tm.bind(i, {
                    dispose: function (entry) {
                        entry.slot.should.equal(1);
                        done();
                    }
                });
            }
            var entry = tm.getEntry(1);
            entry.use = entry.use - 100;

            var slot = tm.bind(3);
            should(slot).equal(1);
        });
    });

    describe("#dispose", function () {
        it("should free space for new textures", function () {
            var tm = this.tm;
            for (var i = 0; i < 3; i++) {
                tm.bind(i, {fixed: true});
            }
            var slot = tm.bind(4);
            should(slot).equal(SimpleTextureManager.FULL);

            tm.dispose(1);
            slot = tm.bind(4);
            should(slot).equal(1);
        })
    });

    describe("#get", function () {
        it("should get a previously bound texture", function () {
            var tm = this.tm;
            tm.bind("test", {fixed: true});
            var entry = tm.getEntry("test");
            var olduse = entry.use = entry.use - 100;
            should(tm.get("test")).equal(0);

            entry = tm.getEntry("test");
            should(entry.use).greaterThan(olduse);
        });
        it("should return 'not found' for unbound textures", function () {
            var tm = this.tm;
            should(tm.get("test")).equal(SimpleTextureManager.NOT_FOUND);
            tm.bind("test", {fixed: true});
            should(tm.get("test")).not.equal(SimpleTextureManager.NOT_FOUND);
            tm.dispose("test");
            should(tm.get("test")).equal(SimpleTextureManager.NOT_FOUND);
        });

    });

    describe("#has", function () {
        it("should have a previously bound texture", function () {
            var tm = this.tm;
            tm.bind("test", {fixed: true});
            var entry = tm.getEntry("test");
            var olduse = entry.use = entry.use - 100;
            should(tm.has("test")).equal(true);

            entry = tm.getEntry("test");
            should(entry.use).equal(olduse);
        });
        it("should return false for unbound textures", function () {
            var tm = this.tm;
            should(tm.has("test")).equal(false);
            tm.bind("test", {fixed: true});
            should(tm.has("test")).equal(true);
            tm.dispose("test");
            should(tm.has("test")).equal(false);
        });

    });
});
