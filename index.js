'use strict';

var Colors = require('colors');
var Moment = require('moment');

var string = require('string');

var internals = {};


module.exports = internals.Colorterm = function(prefix) {

  if (!(this instanceof internals.Colorterm)) {
    return new internals.Colorterm();
  }

  this._prefix = prefix;

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

  if ((typeof input === 'string' || input instanceof String) && input.indexOf('\n') === -1) {
    return true;
  }

  if (typeof input === 'boolean' || input instanceof Boolean) {
    return true;
  }

  if (typeof input === 'number' || input instanceof Number) {
    return true;
  }

  if (input instanceof Date || input instanceof Date) {
    return true;
  }

  if (input === null) {
    return true;
  }

  return false;
}

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
  else if (typeof object === 'array' || object instanceof Array) {
    // If the array is empty, render the `emptyArrayMsg`
    if (object.length === 0) {
      lines.push(self._formatLevel(level, true) + ' ' + new Array(indentation + 1).join(' ') + self._colorLevel(level, '- ', true) + Colors.dim('empty'));
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
          // lines.push(line);
          lines.push(self._parseObject(level, element, indentation + 2));
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

  if (this._prefix) {
    line['prefix'] = this._prefix;
  }

  if (typeof object === 'string' || object instanceof String) {
    this._writeString(line);
  }
  else if (typeof object === 'object' || object instanceof Object) {
    if (typeof object === 'array' || object instanceof Array) {
      line['data'] = '[Array]'
    }
    else if (typeof object === 'object' || object instanceof Object) {
      line['data'] = '{Object}'
    }

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
  var line = '';

  if (object.event) {
    line = this._formatLevel(object.event);
  }

  if (object.prefix) {
    line = line + ' ('+ this._prefix + ')';
  }

  if (object.timestamp) {
    // line = line + ' ' + this._formatTimestamp(object.timestamp);
  }

  if (object.data) {
    line = line + ' ' + object.data;
  }

  this._stdout(line);
}

internals.Colorterm.prototype._stdout = function (output) {
  process.stdout.write(output + '\n');
}
