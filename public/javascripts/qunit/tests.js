/**
 * Custom assertions
 *
 * Somehow, the same approach, that may be seen in other QUnit plugins -
 * extending QUnit itself and not QUnit.assert, does not work as expected. Also,
 * the patch below does not expose `not` to the test method, instead the assert
 * parameter passed to the test function must be used.
 */

QUnit.extend(QUnit.assert, {
  no: function (expected, message) {
    QUnit.ok(!expected, message);
  },
  stringEqual: function (actual, expected, message) {
		QUnit.push(actual.toString() == expected.toString(), actual, expected, message);
  }
});


/**
 * OpenProject instance methods
 */
QUnit.module("OpenProject instance `getFullUrl`");

QUnit.test("with undefined urlRoot", function (assert) {
  var op = new OpenProject({});

  assert.strictEqual(op.getFullUrl('/foo'), '/foo', "works w/ leading slash");
  assert.strictEqual(op.getFullUrl('foo'),  '/foo', "works w/o leading slash");
  assert.strictEqual(op.getFullUrl(''),     '/', "works w/ empty string");
  assert.strictEqual(op.getFullUrl(),       '/', "works w/o parameter");
});

QUnit.test("with empty string urlRoot", function (assert) {
  var op = new OpenProject({urlRoot : ''});

  assert.strictEqual(op.getFullUrl('/foo'), '/foo', "works w/ leading slash");
  assert.strictEqual(op.getFullUrl('foo'),  '/foo', "works w/o leading slash");
  assert.strictEqual(op.getFullUrl(''),     '/', "works w/ empty string");
  assert.strictEqual(op.getFullUrl(),       '/', "works w/o parameter");
});

QUnit.test("with '/' urlRoot", function (assert) {
  var op = new OpenProject({urlRoot : '/'});

  assert.strictEqual(op.getFullUrl('/foo'), '/foo', "works w/ leading slash");
  assert.strictEqual(op.getFullUrl('foo'),  '/foo', "works w/o leading slash");
  assert.strictEqual(op.getFullUrl(''),     '/', "works w/ empty string");
  assert.strictEqual(op.getFullUrl(),       '/', "works w/o parameter");
});

QUnit.test("with urlRoot w/ trailing slash", function (assert) {
  var op = new OpenProject({urlRoot : '/op/'});

  assert.strictEqual(op.getFullUrl('/foo'),  '/op/foo', "works w/ leading slash");
  assert.strictEqual(op.getFullUrl('foo'),   '/op/foo', "works w/o leading slash");
  assert.strictEqual(op.getFullUrl(''),      '/op/', "works w/ empty string");
  assert.strictEqual(op.getFullUrl(),        '/op/', "works w/o parameter");
});

QUnit.test("with urlRoot w/o trailing slash", function (assert) {
  var op = new OpenProject({urlRoot : '/op'});

  assert.strictEqual(op.getFullUrl('/foo'),  '/op/foo', "works w/ leading slash");
  assert.strictEqual(op.getFullUrl('foo'),   '/op/foo', "works w/o leading slash");
  assert.strictEqual(op.getFullUrl(''),      '/op/', "works w/ empty string");
  assert.strictEqual(op.getFullUrl(),        '/op/', "works w/o parameter");
});

QUnit.module("OpenProject instance `fetchProjects`", {
  setup: function () {
    var defaultOptions = {
      url          : new RegExp('.*/projects/level_list\\.json'),
      responseTime : 0
    };

    if (false) {
      jQuery.mockjax(jQuery.extend(defaultOptions, {
        proxy : 'mocks/projects.json'
      }));
    }
    else {
      jQuery.mockjax(jQuery.extend(defaultOptions, {
        responseText : '{"projects":[{"identifier":"bums","created_on":"2012-12-18T07:00:17Z","level":0,"updated_on":"2012-12-18T09:09:10Z","name":"Bums zzz","id":3},{"identifier":"things","created_on":"2012-12-14T14:01:27Z","level":0,"updated_on":"2012-12-14T14:01:27Z","name":"Things","id":1},{"identifier":"things-bums","created_on":"2012-12-18T06:59:50Z","level":1,"updated_on":"2012-12-18T14:26:05Z","name":"Thingsb-Bums","id":2},{"identifier":"bums-bums","created_on":"2012-12-18T08:57:46Z","level":2,"updated_on":"2012-12-18T08:57:46Z","name":"Bums Bums","id":5},{"identifier":"zzz","created_on":"2012-12-18T08:57:14Z","level":0,"updated_on":"2012-12-18T08:57:14Z","name":"ZZZ","id":4}],"size":5}'
      }));
    }
  },
  teardown: function () {
    jQuery.mockjaxClear();
  }
});

QUnit.asyncTest("calls /projects/level_list.json to fetch results", 1, function (assert) {
  var op = new OpenProject();

  op.fetchProjects(function (projects) {
    assert.strictEqual(projects.length, 5);
    QUnit.start();
  });
});

QUnit.asyncTest("adds hname to projects", 5, function (assert) {
  var op = new OpenProject(),
      hname = OpenProject.Helpers.hname;

  op.fetchProjects(function (projects) {
    assert.deepEqual(projects[0].hname, "Bums zzz");
    assert.deepEqual(projects[1].hname, "Things");
    assert.deepEqual(projects[2].hname, hname("Thingsb-Bums", 1));
    assert.deepEqual(projects[3].hname, hname("Bums Bums", 2));
    assert.deepEqual(projects[4].hname, "ZZZ");
    QUnit.start();
  });
});

QUnit.asyncTest("adds parents array to projects", 5, function (assert) {
  var op = new OpenProject();

  op.fetchProjects(function (projects) {
    assert.deepEqual(projects[0].parents, []);
    assert.deepEqual(projects[1].parents, []);
    assert.deepEqual(projects[2].parents, [projects[1]]);
    assert.deepEqual(projects[3].parents, [projects[1], projects[2]]);
    assert.deepEqual(projects[4].parents, []);
    QUnit.start();
  });
});

QUnit.asyncTest("adds tokens to projects", 5, function (assert) {
  var op = new OpenProject();

  op.fetchProjects(function (projects) {
    assert.deepEqual(projects[0].tokens, ["Bums", "zzz"]);
    assert.deepEqual(projects[1].tokens, ["Things"]);
    assert.deepEqual(projects[2].tokens, ["Thingsb", "Bums"]);
    assert.deepEqual(projects[3].tokens, ["Bums", "Bums"]);
    assert.deepEqual(projects[4].tokens, ["ZZZ"]);
    QUnit.start();
  });
});

QUnit.asyncTest("adds url to projects", 5, function (assert) {
  var op = new OpenProject();

  op.fetchProjects(function (projects) {
    assert.deepEqual(projects[0].url, "/projects/bums");
    assert.deepEqual(projects[1].url, "/projects/things");
    assert.deepEqual(projects[2].url, "/projects/things-bums");
    assert.deepEqual(projects[3].url, "/projects/bums-bums");
    assert.deepEqual(projects[4].url, "/projects/zzz");
    QUnit.start();
  });
});

QUnit.asyncTest("adds url to projects with different urlRoot", 5, function (assert) {
  var op = new OpenProject({urlRoot : "/foo"});

  op.fetchProjects(function (projects) {
    assert.deepEqual(projects[0].url, "/foo/projects/bums");
    assert.deepEqual(projects[1].url, "/foo/projects/things");
    assert.deepEqual(projects[2].url, "/foo/projects/things-bums");
    assert.deepEqual(projects[3].url, "/foo/projects/bums-bums");
    assert.deepEqual(projects[4].url, "/foo/projects/zzz");
    QUnit.start();
  });
});

QUnit.asyncTest("caches result", 1, function (assert) {
  var op = new OpenProject();
  op.projects = 'something';

  op.fetchProjects(function (projects) {
    assert.strictEqual(projects, 'something');
    QUnit.start();
  });
});






/**
 * OpenProject.Helpers
 */
QUnit.module("OpenProject.Helpers `hname`");

QUnit.test("adds spaces and arrows to names when level > 0", function (assert) {
  var hname = OpenProject.Helpers.hname;

  assert.strictEqual(hname("a", -1), "a");
  assert.strictEqual(hname("a",  0), "a");
  assert.strictEqual(hname("a",  1), "\u00A0\u00A0\u00A0\u00BB\u00A0a");
  assert.strictEqual(hname("a",  2), "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00BB\u00A0a");
});


QUnit.module("OpenProject.Helpers `hname`");

QUnit.test("adds spaces and arrows to names when level > 0", function (assert) {
  var hname = OpenProject.Helpers.hname;

  assert.strictEqual(hname("a", -1), "a");
  assert.strictEqual(hname("a",  0), "a");
  assert.strictEqual(hname("a",  1), "\u00A0\u00A0\u00A0\u00BB\u00A0a");
  assert.strictEqual(hname("a",  2), "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00BB\u00A0a");
});



/**
 * OpenProject.Helpers.Search
 */
QUnit.module("OpenProject.Helpers.Search `tokenize`");

QUnit.test("with one parameter", function (assert) {
  var t = OpenProject.Helpers.Search.tokenize;

  assert.deepEqual(t("abc"),       ["abc"]);
  assert.deepEqual(t("abc def"),   ["abc", "def"]);
  assert.deepEqual(t("abc  def"),  ["abc", "def"]);
  assert.deepEqual(t(" abc def"),  ["abc", "def"]);
  assert.deepEqual(t("abc/def-"),  ["abc", "def"]);
  assert.deepEqual(t("/abc-def/"), ["abc", "def"]);
});

QUnit.test("with array parameter", function (assert) {
  var t = OpenProject.Helpers.Search.tokenize;

  assert.deepEqual(t("abc",  ["b"]), ["a", "c"]);
  assert.deepEqual(t("abbc", ["b"]), ["a", "c"]);
  assert.deepEqual(t("abc ", ["b"]), ["a", "c "]);
});

QUnit.test("with RegExp parameter", function (assert) {
  var t = OpenProject.Helpers.Search.tokenize;

  assert.deepEqual(t("abc",  /b/), ["a", "c"]);
  assert.deepEqual(t("abbc", /b/), ["a", "c"]);
  assert.deepEqual(t("abc ", /b/), ["a", "c "]);
});



QUnit.module("OpenProject.Helpers.Search `matcher`");

QUnit.test("w/o token parameter", function (assert) {
  var matcher = OpenProject.Helpers.Search.matcher($.fn.select2.defaults.matcher);

  // Basic search
  assert.ok(matcher("",      "abc"),     "matches when looking for empty string");
  assert.ok(matcher("ab",    "abc"),     "matches on sub strings");
  assert.ok(matcher("abc",   "abc"),     "matches on whole matches");
  assert.ok(matcher("AbC",   "aBc"),     "matches case insensitive");
  assert.ok(matcher("b",     "abc"),     "matches within words");
  assert.ok(matcher("ä",     "äbc"),     "matches umlauts");
  assert.ok(matcher("bc de", "abc def"), "matches including spaces");

  assert.no(matcher("abc", "def"), "no match when string not contained");

  // Token search
  assert.no(matcher("b c", "ab-cd"), "no match based on token");
});

QUnit.test("w/ token parameter", function (assert) {
  var matcher = OpenProject.Helpers.Search.matcher($.fn.select2.defaults.matcher),
      token_match = function(term, name) {
        return matcher(term, name, OpenProject.Helpers.Search.tokenize(name));
      };

  // Basic match
  assert.ok(token_match("",      "abc"),     "matches when looking for empty string");
  assert.ok(token_match("ab",    "abc"),     "matches on sub strings");
  assert.ok(token_match("abc",   "abc"),     "matches on whole matches");
  assert.ok(token_match("AbC",   "aBc"),     "matches case insensitive");
  assert.ok(token_match("b",     "abc"),     "matches within words");
  assert.ok(token_match("ä",     "äbc"),     "matches umlauts");
  assert.ok(token_match("bc de", "abc def"), "matches including spaces");


  assert.no(token_match("abc",   "def"),     "no match when string not contained");

  // Token match
  assert.ok(token_match("b c",    "ab c"),    "match when all token contained I");
  assert.ok(token_match("a a",    "ab a"),    "match when all token contained II");
  assert.ok(token_match("a b",    "ab b"),    "match when all token contained III");
  assert.ok(token_match("a b",    "b ab"),    "match when all token contained IV");
  assert.ok(token_match("a a",    "a a"),     "match when all token contained V");
  assert.ok(token_match("bc  de", "abc def"), "matches including spaces");

  assert.no(token_match("a-a", "a a"),  "tokenizes term at white space only");
});
