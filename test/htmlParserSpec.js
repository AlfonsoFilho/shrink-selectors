/*jshint -W030 */

var assert = require("assert");
var chai = require("chai");
var expect = chai.expect;
var fs = require('fs');
var path = require("path");
var htmlParser = require(path.resolve('lib', 'htmlParser.js'))();

var rootPath = process.cwd();
var fixturesPath = path.join(rootPath, 'test', 'fixtures');
var expectedPath = path.join(rootPath, 'test', 'expected');


beforeEach(function () {

});

afterEach(function() {

});


describe('HTML Parser', function () {

  it('should parse HTML into cheerio object', function(){
    expect(htmlParser.parser('<h1>Test</h1>').html).to.be.not.undefined;
    expect(htmlParser.parser('<h1>Test</h1>').html).to.be.function;
  });

  it('should remove dot from class', function(){
    expect(htmlParser.removeDot('.class')).to.be.equal('class');
  });

  it('should remove hash from id', function(){
    expect(htmlParser.removeHash('#id')).to.be.equal('id');
  });

  it('should check if class attribute is map style', function(){
    expect(htmlParser.isMapStyle('class')).to.be.equal(false);
    expect(htmlParser.isMapStyle('class class')).to.be.equal(false);
    expect(htmlParser.isMapStyle('[class]')).to.be.equal(false);
    expect(htmlParser.isMapStyle('[class, class]')).to.be.equal(false);
    expect(htmlParser.isMapStyle('{class: test()}')).to.be.equal(true);
    expect(htmlParser.isMapStyle('{\'class\': test()}')).to.be.equal(true);
    expect(htmlParser.isMapStyle('{"class": test()}')).to.be.equal(true);
    expect(htmlParser.isMapStyle('{"class": test(), "class": test()}')).to.be.equal(true);
  });

  it('should check if class attribute is string style', function(){
    expect(htmlParser.isStringStyle('class')).to.be.equal(true);
    expect(htmlParser.isStringStyle('class class')).to.be.equal(true);
    expect(htmlParser.isStringStyle('[class]')).to.be.equal(false);
    expect(htmlParser.isStringStyle('[class, class]')).to.be.equal(false);
    expect(htmlParser.isStringStyle('{class: test()}')).to.be.equal(false);
    expect(htmlParser.isStringStyle('{\'class\': test()}')).to.be.equal(false);
    expect(htmlParser.isStringStyle('{"class": test()}')).to.be.equal(false);
    expect(htmlParser.isStringStyle('{"class": test(), "class": test()}')).to.be.equal(false);
  });

  it('should replace class from keys', function(){

    var tolkenKey = 'classA';
    var tolkenValue = 'a';

    expect(htmlParser.replaceMapStyle(tolkenKey, tolkenValue, '{classA: test()}')).to.be.equal('{a: test()}');
    expect(htmlParser.replaceMapStyle(tolkenKey, tolkenValue, '{\'classA\': test()}')).to.be.equal('{\'a\': test()}');
    expect(htmlParser.replaceMapStyle(tolkenKey, tolkenValue, '{"classA": test()}')).to.be.equal('{"a": test()}');
    expect(htmlParser.replaceMapStyle(tolkenKey, tolkenValue, '{"classA classA": test()}')).to.be.equal('{"a a": test()}');
    expect(htmlParser.replaceMapStyle(tolkenKey, tolkenValue, '{"classA classA": test("classA")}')).to.be.equal('{"a a": test("classA")}');
  });

  it('should replace class from strings', function(){

    var tolkenKey = 'classA';
    var tolkenValue = 'a';

    expect(htmlParser.replaceStringStyle(tolkenKey, tolkenValue, 'classA')).to.be.equal('a');
    expect(htmlParser.replaceStringStyle(tolkenKey, tolkenValue, 'classA classB')).to.be.equal('a classB');
    expect(htmlParser.replaceStringStyle(tolkenKey, tolkenValue, 'classA skip-classA')).to.be.equal('a skip-classA');
  });

  it('should replace class atributes', function(){
    var htmlSrc = [
      '<div class="classA"></div>',
      '<div class="classB"></div>',
      '<div class="classB classA"></div>',
      '<div class="classB classA classB classA"></div>',
      '<div class="classB skip-classA"></div>',
      '<div class="classB skip-classB"></div>'
    ].join('');
    var expectedHtml = [
      '<div class="a"></div>',
      '<div class="b"></div>',
      '<div class="b a"></div>',
      '<div class="b a b a"></div>',
      '<div class="b skip-classA"></div>',
      '<div class="b skip-classB"></div>'
    ].join('');
    var tolkensMap = { '.classA': 'a', '.classB': 'b' };

    expect(htmlParser.replaceClass(tolkensMap, htmlSrc)).to.be.equal(expectedHtml);
  });

  it('should replace ng-class attributes with MAP style', function () {
    var htmlSrc = [
      '<div ng-class="{\'classB\': classB()}"></div>',
      '<div ng-class="{\'classA\': test(), \'classB\': test()}"></div>'
    ].join('');
    var expectedHtml = [
      '<div ng-class="{\'b\': classB()}"></div>',
      '<div ng-class="{\'a\': test(), \'b\': test()}"></div>'
    ].join('');
    var tolkensMap = { '.classA': 'a', '.classB': 'b' };

    expect(htmlParser.replaceNgClass(tolkensMap, htmlSrc)).to.be.equal(expectedHtml);
  });

  it('should replace ng-class attributes', function(){
    var htmlSrc = [
      '<div ng-class="classB"></div>',
      '<div ng-class="classA classB"></div>',
      '<div ng-class="{\'classB\': classB()}"></div>',
      '<div ng-class="{\'classB\': classB(\'classA\')}"></div>',
      // '<div ng-class=\'{"classB": classB("classA")}\'></div>', // Cheerio always wrap attributes with double quotes
      '<div ng-class="{\'classA\': test(), \'classB\': test()}"></div>',
      '<div ng-class="[classA classB]"></div>',
      '<div ng-class="[classA]"></div>'
    ].join('');
    var expectedHtml = [
      '<div ng-class="b"></div>',
      '<div ng-class="a b"></div>',
      '<div ng-class="{\'b\': classB()}"></div>',
      '<div ng-class="{\'b\': classB(\'classA\')}"></div>',
      // '<div ng-class=\'{"b": classB("classA")}\'></div>', // Cheerio always wrap attributes with double quotes
      '<div ng-class="{\'a\': test(), \'b\': test()}"></div>',
      '<div ng-class="[classA classB]"></div>',
      '<div ng-class="[classA]"></div>'
    ].join('');
    var tolkensMap = { '.classA': 'a', '.classB': 'b' };

    expect(htmlParser.replaceNgClass(tolkensMap, htmlSrc)).to.be.equal(expectedHtml);
  });

  it('should replace data-ng-class atributes', function(){
    var htmlSrc = [
      '<div data-ng-class="classB"></div>',
      '<div data-ng-class="classA classB classA"></div>',
      '<div data-ng-class="{\'classB\': test()}"></div>',
      '<div data-ng-class="{\'classA\': test(), \'classB\': test()}"></div>',
      '<div data-ng-class="[classA classB]"></div>',
      '<div data-ng-class="[classA]"></div>'
    ].join('');
    var expectedHtml = [
      '<div data-ng-class="b"></div>',
      '<div data-ng-class="a b a"></div>',
      '<div data-ng-class="{\'b\': test()}"></div>',
      '<div data-ng-class="{\'a\': test(), \'b\': test()}"></div>',
      '<div data-ng-class="[classA classB]"></div>',
      '<div data-ng-class="[classA]"></div>'
    ].join('');
    var tolkensMap = { '.classA': 'a', '.classB': 'b' };

    expect(htmlParser.replaceDataNgClass(tolkensMap, htmlSrc)).to.be.equal(expectedHtml);
  });

  it('should replace id attributes', function () {
    var htmlSrc = [
      '<div id="firstId"></div>',
      '<div id="secondId"></div>'
    ].join('');
    var expectedHtml = [
      '<div id="a"></div>',
      '<div id="b"></div>'
    ].join('');
    var tolkensMap = { '#firstId': 'a', '#secondId': 'b' };

    expect(htmlParser.replaceID(tolkensMap, htmlSrc)).to.be.equal(expectedHtml);
  });

  it('should replace for attributes', function () {
    var htmlSrc = [
      '<label for="firstId"></label>',
      '<label for="secondId"></label>'
    ].join('');
    var expectedHtml = [
      '<label for="a"></label>',
      '<label for="b"></label>'
    ].join('');
    var tolkensMap = { '#firstId': 'a', '#secondId': 'b' };

    expect(htmlParser.replaceFor(tolkensMap, htmlSrc)).to.be.equal(expectedHtml);
  });

  it('should replace class, ng-classm, data-ng-class, id and for atributes', function(){
    var htmlSrc = [
      '<div id="id-a" class="classA"></div>',
      '<div class="classB"></div>',
      '<div for="id-a" class="classB classA"></div>',
      '<div ng-class="classB"></div>',
      '<div ng-class="{\'classB\': test()}"></div>',
      '<div data-ng-class="classB" class="classA"></div>',
      '<div class="classA classB classA" data-ng-class="[classA classB]"></div>'
    ].join('');
    var expectedHtml = [
      '<div id="c" class="a"></div>',
      '<div class="b"></div>',
      '<div for="c" class="b a"></div>',
      '<div ng-class="b"></div>',
      '<div ng-class="{\'b\': test()}"></div>',
      '<div data-ng-class="b" class="a"></div>',
      '<div class="a b a" data-ng-class="[classA classB]"></div>'
    ].join('');
    var tolkensMap = { '.classA': 'a', '.classB': 'b', '#id-a': 'c' };

    expect(htmlParser.getRefactoredHTML(tolkensMap, htmlSrc)).to.be.equal(expectedHtml);
  });

});