/*jshint -W030 */

var assert = require("assert");
var chai = require("chai");
var expect = chai.expect;
var fs = require('fs');
var path = require("path");
var cssParser = require(path.resolve('lib', 'cssParser.js'))();

var rootPath = process.cwd();
var fixturesPath = path.join(rootPath, 'test', 'fixtures');
var expectedPath = path.join(rootPath, 'test', 'expected');

var srcCSS;


beforeEach(function () {

  srcCSS = fs.readFileSync(path.join(fixturesPath, 'test.css'), {encoding: 'utf8'});

});

afterEach(function() {

});

describe('CSS Parser', function () {

  it('should get classes from css', function(){

    var expectArray = [
      'content',
      'container',
      'hidden',
      'is-home',
      'row',
      'col-xs-12',
      'col-sm-8',
      'col-lg-4',
      'title',
      'link',
      'open',
      'visible-xs',
    ];

    expect(cssParser.getClassesFromCSS(srcCSS)).to.be.deep.equal(expectArray);

  });

  it('should get classes from @media rules', function(){

    var CSSOM = {
      type: 'media',
      media: 'all and (max-width: 300px)',
      rules: [
        { type: 'rule', selectors: ['.row'] }
      ]
    };
    var rule = { type: 'rule', selectors: ['.row'] };

    expect(cssParser.getClassFromMedia(CSSOM)).to.be.deep.equal([{ type: 'rule', selectors: ['.row'] }]);
    expect(cssParser.getClassFromMedia(rule)).to.be.deep.equal({ type: 'rule', selectors: ['.row'] });
  });

  it('should remove duplicate items from an Array', function () {
    expect(cssParser.removeDuplicate(['a'], 'a')).to.be.deep.equal(['a']);
    expect(cssParser.removeDuplicate(['a', 'b'], 'a')).to.be.deep.equal(['a', 'b']);
    expect(cssParser.removeDuplicate(['a', 'b', 'c'], 'b')).to.be.deep.equal(['a', 'b', 'c']);
    expect(cssParser.removeDuplicate(['a', 'b', 'c'], 'd')).to.be.deep.equal(['a', 'b', 'c', 'd']);
  });


  it('should get class from selector', function () {
    expect(cssParser.getClass(['.class'])).to.be.deep.equal(['.class']);
    expect(cssParser.getClass(['.class .class'])).to.be.deep.equal(['.class', '.class']);
    expect(cssParser.getClass(['#id'])).to.be.deep.equal([]);
    expect(cssParser.getClass(['#id > .class'])).to.be.deep.equal(['.class']);
    expect(cssParser.getClass(['#id.classA.classB'])).to.be.deep.equal(['.classA', '.classB']);
    expect(cssParser.getClass(['div[role=\'document\']'])).to.be.deep.equal([]);
  });

  it('should get class from selector', function () {

    var tolkensMap = {
      '.classA': 'a',
      '.classB': 'b',
      '.classC': 'c'
    };

    var cssStr = [
      '.classA { color: #fff }',
      '.classB { color: #fff }',
      '.classC { color: #fff }',
      '#is.classB { color: #fff }',
      '.classB.classA { color: #fff }',
      '.classA > .classB > .classC { color: #fff }'
    ].join();

    var expectedCss = [
      '.a { color: #fff }',
      '.b { color: #fff }',
      '.c { color: #fff }',
      '#is.b { color: #fff }',
      '.b.a { color: #fff }',
      '.a > .b > .c { color: #fff }'
    ].join();

    expect(cssParser.getRefactoredCSS(tolkensMap, cssStr)).to.be.equal(expectedCss);

  });
});