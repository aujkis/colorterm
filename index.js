'use strict';

var Colors = require('colors');
var Moment = require('moment');

var string = require('string');

var internals = {};


module.exports = internals.Colorterm = function() {

  if (!(this instanceof internals.Colorterm)) {
    return new internals.Colorterm();
  }

  return this.init();

}

//
//
//
internals.Colorterm.prototype.init = function() {

  var self = this;

  // https://nodejs.org/api/console.html
  var methods = ['log', 'info', 'error', 'warn', 'dir', 'time', 'timeEnd', 'trace', 'assert'];

  methods.forEach(function (method) {
    if (self[method]) return;

    self[method] = function() {
      return console[method].apply(console, arguments);
    };
  });

  return self;

}

//
//
//
internals.Colorterm.prototype.log = function (object) {
  this._writeEvent('log', object);
}

internals.Colorterm.prototype.info = function (object) {
  this._writeEvent('info', object);
}

internals.Colorterm.prototype.warn = function (object) {
  this._writeEvent('warn', object);
}

internals.Colorterm.prototype.error = function (object) {
  this._writeEvent('error', object);
}

internals.Colorterm.prototype.dir = function (object) {
  this._writeEvent('dir', object);
}

internals.Colorterm.prototype.trace = function (object) {
  this._writeEvent('trace', object);
}


internals.Colorterm.prototype.response = function (object) {
  this._writeEvent('response', object);
}


internals.Colorterm.prototype._isSerializable = function (input, primitives) {
  if (typeof input === 'boolean' ||
      typeof input === 'number' || input === null ||
  input instanceof Date) {
    return true;
  }
  if (typeof input === 'string' && input.indexOf('\n') === -1) {
    return true;
  }

  if (true && primitives) {
    if (Array.isArray(input) && this._isSerializable(input[0], true)) {
      return true;
    }
  }

  return false;
}

// internals.Colorterm.prototype._indentRows = function (object, spaces) {
//   var rows = object.split('\n');
//
//   rows = rows.map(function (line) {
//     return new Array(spaces + 1).join(' ') + line;
//   });
//
//   return rows.join('\n');
// }

internals.Colorterm.prototype._parseObject = function (level, object, indentation) {

  var self = this;
  var lines = [];

  indentation = indentation || 0;

  if (this._isSerializable(object)) {
    lines.push(new Array(indentation + 1).join(' ') + object);
  }
  // else if (typeof data === 'string') {
  //   lines.push(new Array(indentation + 1).join(' ') + '"""');
  //   lines.push(this._indentRows(object, indentation));
  //   lines.push(new Array(indentation + 1).join(' ') + '"""');
  // }
  else if (Array.isArray(object)) {
    // If the array is empty, render the `emptyArrayMsg`
    if (object.length === 0) {
      lines.push(self._formatLevel(level, true) + ' ' + new Array(indentation + 1).join(' ') + 'empty array');
    } else {
      object.forEach(function (element) {
        // Prepend the dash at the begining of each array's element line
        var line = self._colorLevel(level, '- ', true);

        line = self._formatLevel(level, true) + ' ' + new Array(indentation + 1).join(' ') + line;

        // If the element of the array is a string, bool, number, or null
        // render it in the same line
        if (self._isSerializable(element)) {
          line += self._parseObject(level, element);
          lines.push(line);

        // If the element is an array or object, render it in next line
        } else {
          lines.push(line);
          lines.push(self._parseObject(level, element, indentation));
        }
      });
    }
  }
  else if (typeof object === 'object') {
    // Get the size of the longest index to align all the values
    var key;
    var error = object instanceof Error;

    Object.getOwnPropertyNames(object).forEach(function (index) {
      // Prepend the index at the beginning of the line
      key = self._colorLevel(level, (index + ': '), true);

      key = self._formatLevel(level, true) + ' ' + new Array(indentation + 1).join(' ') + key;

      // Skip `undefined`, it's not a valid JSON value.
      if (object[index] === undefined) {
        return;
      }

      // If the value is serializable, render it in the same line
      if (self._isSerializable(object[index]) && (!error || index !== 'stack')) {
        key += self._parseObject(level, object[index]);
        lines.push(key);

        // If the index is an array or object, render it in next line
      } else {
        lines.push(key);
        lines.push(
          self._parseObject(
            level,
            error && index === 'stack' ? object[index].split('\n') : object[index],
            indentation + 2
          )
        );
      }
    });
  }

  if (lines.length > 0) {
    return lines.join('\n');
  }

  // lines.push(this._formatLevel(level, true) + Colors.magenta.dim(' [object placeholder]'));

  // if (lines.length > 0) {
  //   this._stdout(lines.join('\n'));
  // }
  // Default values

  // indentation = indentation || 0;
  // options = options || {};
  // options.emptyArrayMsg = options.emptyArrayMsg || '(empty array)';
  // options.keysColor = options.keysColor || 'green';
  // options.dashColor = options.dashColor || 'green';
  // options.numberColor = options.numberColor || 'blue';
  // options.defaultIndentation = options.defaultIndentation || 2;
  // options.noColor = !!options.noColor;
  //
  // options.stringColor = options.stringColor || null;
  //
  // var output = [];
  //
  // // Helper function to detect if an object can be directly serializable
  // var isSerializable = function(input, onlyPrimitives) {
  //   if (typeof input === 'boolean' ||
  //       typeof input === 'number' || input === null ||
  //   input instanceof Date) {
  //     return true;
  //   }
  //   if (typeof input === 'string' && input.indexOf('\n') === -1) {
  //     return true;
  //   }
  //
  //   if (options.inlineArrays && !onlyPrimitives) {
  //     if (Array.isArray(input) && isSerializable(input[0], true)) {
  //       return true;
  //     }
  //   }
  //
  //   return false;
  // };
  //
  // var indentLines = function(string, spaces){
  //   var lines = string.split('\n');
  //   lines = lines.map(function(line){
  //     return Utils.indent(spaces) + line;
  //   });
  //   return lines.join('\n');
  // };
  //
  // var addColorToData = function(input) {
  //   if (options.noColor) {
  //     return input;
  //   }
  //
  //   if (typeof input === 'string') {
  //     // Print strings in regular terminal color
  //     return options.stringColor ? input[options.stringColor] : input;
  //   }
  //
  //   var sInput = input + '';
  //
  //   if (input === true) {
  //     return sInput.green;
  //   }
  //   if (input === false) {
  //     return sInput.red;
  //   }
  //   if (input === null) {
  //     return sInput.grey;
  //   }
  //   if (typeof input === 'number') {
  //     return sInput[options.numberColor];
  //   }
  //   if (Array.isArray(input)) {
  //     return input.join(', ');
  //   }
  //
  //   return sInput;
  // };
  //
  // // Render a string exactly equal
  // if (isSerializable(data)) {
  //   output.push(Utils.indent(indentation) + addColorToData(data));
  // }
  // else if (typeof data === 'string') {
  //   //unserializable string means it's multiline
  //   output.push(Utils.indent(indentation) + '"""');
  //   output.push(indentLines(data, indentation + options.defaultIndentation));
  //   output.push(Utils.indent(indentation) + '"""');
  // }
  // else if (Array.isArray(data)) {
  //   // If the array is empty, render the `emptyArrayMsg`
  //   if (data.length === 0) {
  //     output.push(Utils.indent(indentation) + options.emptyArrayMsg);
  //   } else {
  //     data.forEach(function(element) {
  //       // Prepend the dash at the begining of each array's element line
  //       var line = ('- ');
  //       if (!options.noColor) {
  //         line = line[options.dashColor];
  //       }
  //       line = Utils.indent(indentation) + line;
  //
  //       // If the element of the array is a string, bool, number, or null
  //       // render it in the same line
  //       if (isSerializable(element)) {
  //         line += self._parseObject(element, options);
  //         output.push(line);
  //
  //       // If the element is an array or object, render it in next line
  //       } else {
  //         output.push(line);
  //         output.push(self._parseObject(
  //           element, options, indentation + options.defaultIndentation
  //         ));
  //       }
  //     });
  //   }
  // }
  // else if (typeof data === 'object') {
  //   // Get the size of the longest index to align all the values
  //   var maxIndexLength = Utils.getMaxIndexLength(data);
  //   var key;
  //   var isError = data instanceof Error;
  //
  //   Object.getOwnPropertyNames(data).forEach(function(i) {
  //     // Prepend the index at the beginning of the line
  //     key = (i + ': ');
  //     if (!options.noColor) {
  //       key = key[options.keysColor];
  //     }
  //     key = Utils.indent(indentation) + key;
  //
  //     // Skip `undefined`, it's not a valid JSON value.
  //     if (data[i] === undefined) {
  //       return;
  //     }
  //
  //     // If the value is serializable, render it in the same line
  //     if (isSerializable(data[i]) && (!isError || i !== 'stack')) {
  //       key += self._parseObject(data[i], options, maxIndexLength - i.length);
  //       output.push(key);
  //
  //       // If the index is an array or object, render it in next line
  //     } else {
  //       output.push(key);
  //       output.push(
  //         self._parseObject(
  //           isError && i === 'stack' ? data[i].split('\n') : data[i],
  //           options,
  //           indentation + options.defaultIndentation
  //         )
  //       );
  //     }
  //   });
  // }
  //
  // // Return all the lines as a string
  // return output.join('\n');
}

internals.Colorterm.prototype._colorLevel = function(level, output, dim) {
  if (dim == true) {
    output = Colors.dim(output);
  }

  switch(level) {
    case 'log':
      return Colors.bold.white.dim(output);
      break;
    case 'info':
      return Colors.bold.cyan(output);
      break;
    case 'warn':
      return Colors.bold.yellow(output);
      break;
    case 'error':
      return Colors.bold.red(output);
      break;
    case 'dir':
      return Colors.bold.magenta(output);
      break;
    case 'trace':
      return Colors.bold(output);
      break;
    case 'response':
      return Colors.bold.green(output);
      break;
    default:
      return Colors.white(output);
  }
}
//
//
//
internals.Colorterm.prototype._formatLevel = function (level, hidden) {
  if (hidden == true) {
    var output = this._colorLevel(level, string('|').padLeft(10, ' '));
  }
  else {
    var output = this._colorLevel(level, string(level + ' |').padLeft(10, ' '));
  }

  return output;
}

internals.Colorterm.prototype._formatTimestamp = function (timestamp) {
  var moment = Moment.utc(timestamp);

  // moment.local();

  return Colors.italic.dim(moment.format('HH:mm:ss.SSS'));
}

internals.Colorterm.prototype._writeEvent = function(level, object) {
  var type = level + '#' + typeof object;
  var line = {
    event: level,
    timestamp: new Date().getTime(),
    data: object
  }

  if (typeof object === 'string' || object instanceof String) {
    this._writeString(line);
  }
  else if (typeof object === 'object' || object instanceof Object) {
    line['data'] = Colors.white('Write object to string parser for console.' + level + '(object)');

    this._writeString(line);

    if (this._parseObject(level, object)) {
      this._stdout(this._parseObject(level, object));
    }
  }
  else {
    line['event'] = 'error';
    line['data'] = Colors.white('Missing ' + Colors.bold(type) +' event handler');

    this._writeString(line);
  }
}

//
//
//
internals.Colorterm.prototype._writeString = function (object) {
  var line = '%level %timestamp %data';
  var substitutions = {
    '%level': this._formatLevel(object.event),
    '%timestamp': this._formatTimestamp(object.timestamp),
    '%data': object.data
  };

  line = line.replace(/%\w+/g, function (all) {
    return substitutions[all] || all;
  });

  this._stdout(line);
}

internals.Colorterm.prototype._stdout = function (output) {
  process.stdout.write(output + '\n');
}


//
// internals.Colorterm.prototype.log = function () {
//   process.stdout.write('log called' + '\n');
// }
//
// internals.Colorterm.prototype.debug = function () {
//   process.stdout.write('debug called' + '\n');
// }

// internals.Colorterm.prototype.log = function () {
//   process.stdout.write('hi' + '\n');
// }

//
// var Colors = require('colors');
// var Moment = require('moment');
// var Util = require("util");
//
// var PrettyJSON = require('prettyjson');
// var StringPadder = require('string-padder');
//
// var Colorterm;
//
// module.exports = Colorterm = function(prefix, parent, patch) {
//   var object;
//   var noFormat = false;
//   // Fiddle optional arguments
//   patch = Array.prototype.slice.call(arguments, -1)[0];
//   if (typeof patch === 'object') {
//     noFormat = patch.noFormat;
//     patch = patch.patch;
//   }
//   if (typeof patch !== "boolean") patch = false;
//   if (typeof prefix === "object" && prefix !== null) {
//     parent = prefix;
//     prefix = undefined;
//   }
//
//   if (patch && parent) {
//     // Modify given object when patching is requested
//     object = parent;
//   }
//   else {
//     // Otherwise create new object
//     object = {};
//     if (parent && parent._prefixes) {
//       // and inherit prefixes from the given object
//       object._prefixes = parent._prefixes.slice();
//     }
//   }
//
//   // Append new prefix
//   if (!object._prefixes) object._prefixes = [];
//   if (prefix) object._prefixes.push(prefix);
//
//   object.log = messageOverlay('log', object._prefixes, noFormat);
//   object.info = messageOverlay("info", object._prefixes, noFormat);
//   object.warn = messageOverlay('warn', object._prefixes, noFormat);
//   object.error = messageOverlay('error', object._prefixes, noFormat);
//   object.dir = messageOverlay('dir', object._prefixes, noFormat);
//
//   consoleProxy(object);
//
//   return object;
// }
//
// Colorterm.getStream = function() {
//   return process.stderr;
// }
//
// Colorterm.writeStream = function(level, prefixes, message) {
//   var substitutions = {
//     '%time': Colors.italic.dim(Colorterm.getTime()),
//     '%level': levelFormat(level),
//     '%message': message
//   }
//
//   if (prefixes.length > 0) {
//     substitutions['%prefixes'] = Colors.white('('+prefixes.join(',')+')');
//     var line = '%level %time %prefixes %message';
//   }
//   else {
//     var line = '%level %time %message';
//   }
//
//   // var time = Colors.italic.underline.dim('%s'.replace('%s', colorterm.getTime()));
//   // var line = time + level + ":";
//   // if (prefixes.length > 0) line += " " + prefixes.join(",");
//   // line += " " + msg;
//
//   var line = line.replace(/%\w+/g, function(all) {
//     return substitutions[all] || all;
//   });
//
//   Colorterm.getStream().write(line + "\n");
//
//   if (level == 'dir') {
//     var options = {
//       keysColor: 'magenta',
//       numberColor: 'white',
//       stringColor: 'grey',
//       dashColor: 'green'
//     }
//
//     Colorterm.getStream().write(PrettyJSON.render(message, options) + '\n');
//   }
// }
//
//
// Colorterm.getTime = function() {
//   var timestamp = new Date().getTime()
//   var moment = Moment.utc(timestamp);
//
//   moment.local();
//
//   return moment.format('HH:mm:ss.SSS')
// };
//
// function messageOverlay(level, prefixes, noFormat) {
//   return function () {
//     // Handle formatting and circular objects like in the original
//     // console.log(message);
//     // console.log(Array.prototype.slice.call(arguments));
//     // console.log(Util.format.apply(this, arguments));
//     // var message = noFormat ? Array.prototype.slice.call(arguments) : Util.format.apply(this, arguments);
//
//     switch(level) {
//       case 'dir':
//         var message = Array.prototype.slice.call(arguments, -1)[0];
//         break;
//       default:
//         var message = noFormat ? Array.prototype.slice.call(arguments) : Util.format.apply(this, arguments);
//     }
//
//     Colorterm.writeStream(level, prefixes, message);
//   };
// }
//
// function levelFormat(level) {
//   var output = StringPadder.padLeft(level + ' |', 10);
//
//   switch(level) {
//     case 'log':
//       return Colors.bold.white.dim(output);
//       break;
//     case 'info':
//       return Colors.bold.cyan(output);
//       break;
//     case 'warn':
//       return Colors.bold.yellow(output);
//       break;
//     case 'error':
//       return Colors.bold.red(output);
//       break;
//     case 'dir':
//       return Colors.bold.magenta(output);
//       break;
//     default:
//       return Colors.white(output);
//   }
// }
//
// function consoleProxy(object) {
//   var methods = ['time', 'timeEnd', 'trace', 'assert'];
//
//   methods.forEach(function(method) {
//     if (object[method]) return;
//
//     object[method] = function(){
//       return console[method].apply(console, arguments);
//     };
//   });
// }
