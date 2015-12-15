CodeMirror.defineMode('esnext', function(conf, parserConf) {
  var ERRORCLASS = 'error';
  var isOperatorChar = /[+\-*&%=<>!?|~^]/;

  function readRegexp(stream) {
    var escaped = false;
    var inSet = false;
    var next;
    while ((next = stream.next()) != null) {
      if (!escaped) {
        if (next === '/' && !inSet) {
          return;
        }
        if (next === '[') {
          inSet = true;
        } else if (inSet && next == ']') {
          inSet = false;
        }
      }
      escaped = !escaped && next == '\\';
    }
  }

  // comment token
  function tokenComment(stream, state) {
    var maybeEnd = false;
    var ch;
    while (ch = stream.next()) {
      if (ch === '@') {
        state.scope.type = 'comment';
        state.tokenize = tokenCommentProperty;
        break;
      }
      if (ch === '/' && maybeEnd) {
        state.tokenize = tokenBase;
        state.scope.type = 'sol';
        break;
      }
      maybeEnd = ch === '*';
    }
    return 'comment';
  }
  // super jsdoc defined property multi line comments
  function tokenCommentProperty(stream, state) {
    while (stream.eat(/[\S]/)) {
      if (stream.match(/[\:\ ]/) || stream.eol()) {
        state.tokenize = tokenBase;
        break;
      }
    }
    return 'def';
  }

  function tokenBase(stream, state) {
    if (stream.sol() && state.scope.type === 'sol') {
      // all space class indented;
      // eat space
      if (stream.eatSpace()) {
        var lineOffset = stream.indentation();
        if (lineOffset) {
          return 'indent';
        }
        return null;
      }
    }

    var ch = stream.next();
    if (state.scope.type === 'comment') {
      state.tokenize = tokenComment;
      return state.tokenize(stream, state);
    }
    if (ch === '/') {
      if (stream.eat('*')) {
        state.tokenize = tokenComment;
        state.scope.type = 'comment';
        return tokenComment(stream, state);
      } else if (stream.eat('/')) {
        stream.skipToEnd();
        return 'comment';
      } else if (/^(?:operator|sol|keyword c|case|new|[\[{}\(,;:])$/.test(
          state.scope.type)) {
        readRegexp(stream);
        stream.match(/^\b(([gimyu])(?![gimyu]*\2))+\b/);
        return 'regexp';
      } else {
        stream.eatWhile(isOperatorChar);
        return 'operator';
      }
    }
    return ERRORCLASS;
  }

  var esnext = {
    startState: function(basecolumn) {
      return {
        tokenize: tokenBase,
        scope: {
          offset: basecolumn || 0,
          type: 'sol'
        },
        prop: false,
        indented: 0
      };
    },

    token: function(stream, state) {

      return state.tokenize(stream, state);
    },

    blockCommentStart: '/*',
    blockCommentEnd: '*/',
    lineComment: '//',
    fold: 'brace',
    closeBrackets: '()[]{}\'\'""``',
  };

  return esnext;
});


CodeMirror.defineMIME('text/javascript', 'esnext');
CodeMirror.defineMIME('text/ecmascript', 'esnext');
CodeMirror.defineMIME('text/babel', 'esnext');
CodeMirror.defineMIME('text/jsx', 'esnext');
CodeMirror.defineMIME('application/javascript', 'esnext');
CodeMirror.defineMIME('application/x-javascript', 'esnext');
CodeMirror.defineMIME('application/ecmascript', 'esnext');
CodeMirror.defineMIME('application/json', {
  name: 'esnext',
  json: true
});
