 function wordRegexp(words) {
   return new RegExp('^((' + words.join(')|(') + '))\\b');
 }

 var reservedKeywords = ['break', 'case', 'catch', 'continue', 'debugger', 'default', 'delete', 'do', 'else', 'export', 'finally', 'for', 'if', 'import', 'from', 'in', 'return', 'switch', 'this', 'throw', 'try', 'void', 'while', 'with'];

 var operatorKeyworks = ['var', 'const', 'let', 'class', 'extends', 'function', 'of', 'in', 'instanceof', 'typeof', 'super', 'void', 'yield', 'new', 'constructor'];

 var domKeyworks = ['document'];

 var builtinKeyworks = ['constructor', 'decodeURI', 'decodeURIComponent', 'encodeURI', 'encodeURIComponent', 'escape', 'eval', 'hasOwnProperty', 'isFinite', 'isNaN', 'isPrototypeOf', 'parseFloat', 'parseInt', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'unescape', 'valueOf', 'yield'];

 var futureReservedKeywords = ['enum', 'await', 'implements', 'package', 'protected', 'static', 'interface', 'private', 'public', 'abstract', 'boolean', 'byte', 'char', 'double', 'final', 'float', 'goto', 'int', 'long', 'native'];


 var entityKeyworks = ['Array', 'ArrayBuffer', 'Boolean', 'DataView', 'Date', 'Float32Array', 'Float64Array', 'Function', 'Infinity', 'Int16Array', 'Int32Array', 'Int8Array', 'JSON', 'Map', 'Math', 'NaN', 'Number', 'Object', 'Promise', 'Proxy', 'Reflect', 'RegExp', 'Set', 'String', 'Symbol', 'System', 'TypeError', 'Uint16Array', 'Uint32Array', 'Uint8Array', 'Uint8ClampedArray', 'WeakMap', 'WeakSet'];