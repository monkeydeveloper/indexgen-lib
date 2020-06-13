process.env.NODE_ENV = 'test';

var expect = require('chai').expect;
var sinon = require('sinon');
var mockfs = require('mock-fs');

var Indexgen = require('../lib/indexgen');
var ig = new Indexgen();

var fakeFs = {
				"dirA1": {
					"dirA2": {
						"fileA2A.js": "content fileA2A.js",
						"index.js": "content index.js",
					},
					"fileA1A.js": "content fileA1A.js",
					"fileA1B.js": "content fileA1B.js",
					"fileA1C.js": "content fileA1C.js",
					"fileA1D.pdf": "content fileA1D.pdf"
				},
				"dirB1": {
					"fileB1A.js": "content fileB1A.js",
					"fileB1B.js": "content fileB1B.js",
					"fileB1C.pdf": "content fileB1C.pdf"
				},
				"dirC1": {
					"dirC2A": {
						"fileC2AA.js": "content fileC2AA.js",
						"fileC2AB.js": "content fileC2AB.js",
						"fileC2AC.js": "content fileC2AC.js"
					},
					"dirC2B": {
						"fileC2BA.js": "content fileC2BA.js"
					},
					"dirC2C": {
						"fileC2CA.js": "content fileC2CA.js",
						"fileC2CB.js": "content fileC2CB.js"
					}
				},
				"fileA1.js": "content fileA1",
				"index.js": "content index.js root directory",
				".gitignore": "content .gitignore",
				"igignore.json": '["dirB1"]'
			};

describe('indexgen with igignore.json', function() {
	describe('init() calls appropiate methods.', function() {
		var mockIg = null;

		before(function() {
			mockIg = sinon.mock(ig);
		});

		it('should call parseIgignore and path.resolve', function() {
			mockIg.expects('parseIgignore').once();

			ig.init();

			mockIg.verify();
		});
	});

	describe('parseIgignore()', function() {
		var igignore = [];

		before(function() {
			mockfs(fakeFs);
		});

		it('should set ig.igignore property to [".git", "node_modules", "dirB1"]', function() {
			var igignoreParsed = ig.parseIgignore([".git", "node_modules"]);

			expect(igignoreParsed).to.eql([".git", "node_modules", "dirB1"]);
		});

		after(function() {
			mockfs.restore();
		});
	});

	describe('indexgen()', function() {
		before(function() {

		});

		it('should set ig.igignore property to [".git", "node_modules", "dirB1"]', function() {

		});

		after(function() {

		});
	});
});