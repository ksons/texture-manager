var should = require('should');
var SimpleTextureManager = require("..").SimpleTextureManager;

describe("Texture Manager", function () {
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
            var slot, entry, now = Date.now();
            var tm = this.tm;

            slot = tm.bind(1);
            should(slot).equal(0);
            entry = tm.getEntry(1);
            entry.should.have.property("id", 1);
            entry.should.have.property("fixed", false);
            entry.should.have.property("slot", slot);
            entry.should.have.property("use").greaterThan(now - 1);

            slot = tm.bind(2, {fixed: true});
            should(slot).equal(1);

            entry = tm.getEntry(2);
            entry.should.have.property("id", 2);
            entry.should.have.property("fixed", true);
            entry.should.have.property("slot", slot);
            entry.should.have.property("use").greaterThan(now - 1);

            slot = tm.bind(2, {fixed: true});
            should(slot).equal(1);

            entry = tm.getEntry(2);
            entry.should.have.property("id", 2);
            entry.should.have.property("fixed", true);
            entry.should.have.property("slot", slot);
            entry.should.have.property("use").greaterThan(now - 1);

            slot = tm.bind(3, {fixed: true});
            should(slot).equal(2);

            entry = tm.getEntry(3);
            entry.should.have.property("id", 3);
            entry.should.have.property("fixed", true);
            entry.should.have.property("slot", slot);
            entry.should.have.property("use").greaterThan(now - 1);
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

    describe("dispose", function () {
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
    })
});
