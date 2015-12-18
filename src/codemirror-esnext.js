CodeMirror.defineMode('esnext', function(config, parserConf) {
  var ERRORCLASS = 'error';
  var indentUnit = config.indentUnit;
  var isOperatorChar = /[+\-*&%=<>!?|~^]|\.\.\./;

  function wordRegexp(words) {
    return new RegExp('^((' + words.join(')|(') + '))\\b');
  }
  var reservedKeywords = ['break', 'case', 'catch', 'continue', 'debugger', 'default', 'delete', 'do', 'else', 'export', 'finally', 'for', 'if', 'import', 'from', 'in', 'return', 'switch', 'this', 'throw', 'try', 'void', 'while', 'with'];
  var operatorKeyworks = ['var', 'const', 'let', 'class', 'extends', 'function', 'of', 'in', 'instanceof', 'typeof', 'super', 'void', 'yield', 'new', 'constructor'];
  var futureReservedKeywords = ['enum', 'await', 'implements', 'package', 'protected', 'static', 'interface', 'private', 'public', 'abstract', 'boolean', 'byte', 'char', 'double', 'final', 'float', 'goto', 'int', 'long', 'native'];

  var domKeyworks = ['document'];

  var builtinKeyworks = ['constructor', 'decodeURI', 'decodeURIComponent', 'encodeURI', 'encodeURIComponent', 'escape', 'eval', 'hasOwnProperty', 'isFinite', 'isNaN', 'isPrototypeOf', 'parseFloat', 'parseInt', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'unescape', 'valueOf', 'yield'];
  var entityKeyworks = ['Array', 'ArrayBuffer', 'Boolean', 'DataView', 'Date', 'Float32Array', 'Float64Array', 'Function', 'Infinity', 'Int16Array', 'Int32Array', 'Int8Array', 'JSON', 'Map', 'Math', 'NaN', 'Number', 'Object', 'Promise', 'Proxy', 'Reflect', 'RegExp', 'Set', 'String', 'Symbol', 'System', 'TypeError', 'Uint16Array', 'Uint32Array', 'Uint8Array', 'Uint8ClampedArray', 'WeakMap', 'WeakSet'];

  var keywords = wordRegexp(reservedKeywords.concat(futureReservedKeywords))
  operatorKeyworks = wordRegexp(operatorKeyworks);
  builtinKeyworks = wordRegexp(builtinKeyworks);
  entityKeyworks = wordRegexp(entityKeyworks.concat(domKeyworks));


  var type;
  var content;

  function restyle(tp, style, cont) {
    type = tp;
    content = cont;
    return style;
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
        if (stream.eat('\\')) {
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
    var ch;
    if (ch = stream.next()) {
      if (ch === '}') {
        state.tokenize = tokenQuasi;
        return 'string-2';
      }
      return 'variable';
    }
  }

  function tokenQuasi(stream, state) {
    var maybeEnd = false;
    var ch;
    if (!stream.eol()) {
      ch = stream.next();
      if (ch === '$' && stream.eat('{')) {
        state.tokenize = tokenQuasiVariable;
        return restyle('string', 'string-2');
      }
      if (ch === '`') {
        state.tokenize = tokenBase;
        return restyle('string', 'string-2');
      }
      stream.eatWhile(/[^\`\$]/);
      return restyle('string', 'string');
    }
  }

  // super jsdoc defined property multi line comments
  function tokenCommentProperty(stream, state) {
    var ch;
    while (ch = stream.peek()) {
      if (ch === '*' || ch === ':' || ch === ' ' || stream.eol()) {
        state.tokenize = tokenComment;
        break;
      }
      stream.next();
    }
    return restyle('comment', 'def');
  }

  // comment token
  function tokenComment(stream, state) {
    var maybeEnd = false;
    var ch;
    while (ch = stream.next()) {
      if (ch === '@') {
        state.tokenize = tokenCommentProperty;
        break;
      }
      if (ch === '/' && maybeEnd) {
        state.tokenize = tokenBase;
        break;
      }
      maybeEnd = ch === '*';
    }
    return restyle('comment', 'comment');
  }

  function tokenBase(stream, state) {
    if (stream.sol() && state.scope.type === 'normal') {
      // all space class indented;
      // eat space
      if (stream.eatSpace()) {
        var lineOffset = stream.indentation();
        if (lineOffset) {
          return restyle('indent', 'indent');
        }
        return null;
      }
    }

    if (stream.eatSpace()) {
      return null;
    }

    if (stream.match(keywords)) {
      return 'keyword';
    }

    if (stream.match(operatorKeyworks)) {
      return 'keyword-2';
    }

    if (stream.match(builtinKeyworks)) {
      return 'keyword builtin';
    }

    if (stream.match(isOperatorChar)) {
      return 'keyword operator';
    }

    if (stream.match(entityKeyworks)) {
      return 'keyword entity';
    }

    if (stream.match(/[()\[\]{},:=;]/)) {
      return restyle(stream.current());
    }

    // if (stream.match(/\.[_a-z]+\s*(?:\()/i)) {
    //   return 'property';
    // }

    if (stream.match(/\.[_\$a-z]+/i)) {
      return 'variable';
    }

    // if (stream.match()) {}

    var ch = stream.next();
    console.log(ch)
    if (ch == '"' || ch == "'") { // eslint-disable-line quotes
      state.tokenize = tokenFactory(stream.current(), false, 'string');
      return state.tokenize(stream, state);
    } else if (ch == '`') {
      state.tokenize = tokenQuasi;
      return restyle('string', 'string-2');
    } else if (ch === '/') {
      if (stream.eat('*')) {
        state.tokenize = tokenComment;
        return tokenComment(stream, state);
      } else if (stream.eat('/')) {
        stream.skipToEnd();
        return restyle('comment', 'comment');
      } else if (/^(?:operator|normal|keyword c|case|new|[\[{}\(,;:])$/.test(
          state.lastType)) {
        readRegexp(stream);
        stream.match(/^\b(([gimyu])(?![gimyu]*\2))+\b/);
        return restyle('regexp', 'regexp');
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
