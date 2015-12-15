CodeMirror.defineMode('esnext', function(config, parserConf) {
  var ERRORCLASS = 'error';
  var indentUnit = config.indentUnit
  var isOperatorChar = /[+\-*&%=<>!?|~^]/;

  // Parser

  var atomicTypes = {
    "atom": true,
    "number": true,
    "variable": true,
    "string": true,
    "regexp": true,
    "this": true
  };

  function JSLexical(indented, column, type, align, prev, info) {
    this.indented = indented;
    this.column = column;
    this.type = type;
    this.prev = prev;
    this.info = info;
    if (align != null) this.align = align;
  }

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

  function tokenFactory(delimiter, singleline, outclass) {
    return function(stream, state) {
      while (!stream.eol()) {
        stream.eatWhile(/[^'"\/\\]/);
        if (stream.eat("\\")) {
          stream.next();
          if (singleline && stream.eol()) {
            return outclass;
          }
        } else if (stream.match(delimiter)) {
          state.tokenize = tokenBase;
          return outclass;
        } else {
          stream.eat(/['"\/]/);
        }
      }
      if (singleline) {
        if (parserConf.singleLineStringErrors) {
          outclass = ERRORCLASS;
        } else {
          state.tokenize = tokenBase;
        }
      }
      return outclass;
    };
  }

  function tokenQuasiVariable(stream, state) {
    while (ch = stream.next()) {
      if (ch === '}') {
        state.tokenize = tokenQuasi;
        return 'keyword'
        break;
      }
      return 'variable'
    }
  }

  function tokenQuasi(stream, state) {
    var maybeEnd = false;
    while (!stream.eol()) {
      ch = stream.next();
      if (ch === '$' && stream.eat('{')) {
        state.scope.type = 'quasi';
        state.tokenize = tokenQuasiVariable;
        return 'string-2'
      }
      if (ch === '`') {
        state.scope.type = 'normal';
        state.tokenize = tokenBase;
        return 'string-2'
      }
      return 'string'
    }
  }

  // super jsdoc defined property multi line comments
  function tokenCommentProperty(stream, state) {
    while (ch = stream.peek()) {
      if (ch === '*' || ch === ':' || ch === ' ' || stream.eol()) {
        state.tokenize = tokenComment;
        break;
      }
      stream.next();
    }
    return 'comment def';
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
        state.scope.type = 'normal';
        break;
      }
      maybeEnd = ch === '*';
    }
    return 'comment';
  }

  function tokenBase(stream, state) {
    if (stream.sol() && state.scope.type === 'normal') {
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
    if (ch == '"' || ch == "'") {
      state.tokenize = tokenFactory(stream.current(), false, "string");
      return state.tokenize(stream, state);
    } else if (ch == "`") {
      state.tokenize = tokenQuasi;
      return 'string-2';
    } else if (ch === '/') {
      if (stream.eat('*')) {
        state.tokenize = tokenComment;
        state.scope.type = 'comment';
        return tokenComment(stream, state);
      } else if (stream.eat('/')) {
        stream.skipToEnd();
        return 'comment';
      } else if (/^(?:operator|normal|keyword c|case|new|[\[{}\(,;:])$/.test(
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
        lexical: new JSLexical((basecolumn || 0) - indentUnit, 0, "block", false),
        scope: {
          offset: basecolumn || 0,
          type: 'normal',
          prev: null,
          align: false,
          content: null
        },
        prop: false,
        indented: 0
      };
    },

    token: function(stream, state) {
      return state.tokenize(stream, state);
    },

    closeBrackets: '()[]{}\'\'""``',
    electricInput: /^\s*(?:case .*?:|default:|\{|\})$/,
    blockCommentStart: '/*',
    blockCommentEnd: '*/',
    blockCommentContinue: ' * ',
    lineComment: '//',
    fold: 'brace',
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
