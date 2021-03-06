/* -----------------------------------------------------------------------------
 * Copyright © 2015, Numenta, Inc. Unless you have purchased from
 * Numenta, Inc. a separate commercial license for this software code, the
 * following terms and conditions apply:
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero Public License version 3 as published by
 * the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero Public License for
 * more details.
 *
 * You should have received a copy of the GNU Affero Public License along with
 * this program. If not, see http://www.gnu.org/licenses.
 *
 * http://numenta.org/licenses/
 * -------------------------------------------------------------------------- */


// NOTE: Must be ES5 for now, Electron's `remote` does not like ES6 Classes!
/* eslint-disable no-var, object-shorthand, prefer-arrow-callback */

// externals

import csv from 'csv-streamify';
import filesystem from 'fs';
import path from 'path';
import TimeAggregator from './TimeAggregator';
import Utils from './Utils';

// internals

const SAMPLES_FILE_PATH = path.join(__dirname, '..', 'samples');


/**
 * Unicorn: FileServer - Respond to a FileClient over IPC, sharing our access to
 *  the Node layer of filesystem, so client can CRUD files.
 * @class
 * @module
 */
function FileServer() {
}


/**
 * Reads the entire contents of a file.
 * @param {string} filename - The absolute path of the CSV file to load
 * @param {Function} callback - Async callback: function (error, results)
 */
FileServer.prototype.getContents = function (filename, callback) {
  filesystem.readFile(filename, callback);
};

/**
 * Get a list of sample files embedded with the application.
 * @param {Function} callback - Async callback: function (error, results)
 */
FileServer.prototype.getSampleFiles = function (callback) {
  filesystem.readdir(SAMPLES_FILE_PATH, function (error, data) {
    var files;
    if (error) {
      callback(error, null);
      return;
    }
    files = data.map((item) => {
      var filename = path.resolve(SAMPLES_FILE_PATH, item);
      return {
        uid: Utils.generateId(filename),
        name: path.basename(item),
        filename: filename,
        type: 'sample'
      };
    });

    callback(null, files);
  });
};

/**
 * Get a list of uploaded files.
 * @param {Object} file - File getting uploaded
 * @param {Function} callback - Async callback: function (error, results)
 */
FileServer.prototype.getUploadedFiles = function (file, callback) {
  var formattedFile = {
    name: file.name,
    filename: file.path,
    type: 'uploaded',
    metrics: []
  };

  this.getFields(formattedFile.filename, {}, (error, fields) => {
    if (error) {

      callback(error);
      return;
    }
    formattedFile.metrics = fields;
    callback(error, formattedFile);
  });
};

/**
 * Get all field definitions for the give file guessing data types based on
 *  first record.
 * @param {string} filename - The absolute path of the CSV file
 * @param {Object} options -  Optional settings. See #getData()
 * @param {Function} callback - Called with an array of field definitions in the
 *  following format:
 *  <code> { name:'fieldName', type:'number', date:'string' } </code>
 */
FileServer.prototype.getFields = function (filename, options, callback) {
  var fields = [];
  var fieldName, stream;

  // "options" is optional
  if (typeof callback == 'undefined' && typeof options == 'function') {
    callback = options;
    options = {};
  }
  // Update default values
  if (!('columns' in options)) {
    options.columns = true;
  }

  options.objectMode = true;
  stream = filesystem.createReadStream(path.resolve(filename));
  stream.pipe(csv(options))
    .once('data', function (data) {
      if (data) {
        for (fieldName in data) {
          const val = data[fieldName];
          const field = {
            uid: Utils.generateModelId(filename, fieldName),
            file_uid: Utils.generateId(filename),
            name: fieldName,
            type: 'string'
          };
          if (Number.isFinite(Number(val))) {
            field.type = 'number';
          } else if (Number.isFinite(Date.parse(val))) {
            field.type = 'date';
          }
          fields.push(field);
        }
        stream.unpipe();
        stream.destroy();
        callback(null, fields);
        return;
      }
    })
    .once('error', callback)
    .once('end', callback);
};

/**
 * Get data from the given CSV file.
 * @param {string} filename - The absolute path of the CSV file to load
 * @param {Object} options - Optional settings
 *                    See https://github.com/klaemo/csv-stream#options
 *                    <code>
 *                     {
 *                        delimiter: ',', // comma, semicolon, whatever
 *                        newline: 'n', // newline character
 *                        quote: '"', // what's considered a quote
 *                        empty: '', // empty fields are replaced by this,
 *
 *                        // if true, emit array of {Object}s
 *                        // instead of array of strings
 *                        objectMode: false,
 *
 *                        // if set to true, uses first row as keys ->
 *                        // [ { column1: value1, column2: value2 , ...]}
 *                        columns: true,
 *
 *                        // Max Number of records to process
 *                        limit: Number.MAX_SAFE_INTEGER,
 *
 *                        // Aggregation settings. See {TimeAggregator}
 *                        aggregation: {
 *                       		// Name of the field representing 'time'
 *                          'timefield' : {String},
 *                          // Name of the field containing the 'value'
 *                          'valuefield': {String},
 *                          // Aggregation function to use:
 *                          //   'sum', 'count', 'avg', 'min', 'max'
 *                          'function' : {String},
 *                          // Time interval in milliseconds
 *                          'interval' : {number}
 *                        }
 *                      }
 *                    </code>
 * @param {Function} callback - This callback to be called on every record.
 *                              <code>function (error, data)</code>
 */
FileServer.prototype.getData = function (filename, options, callback) {
  // "options" is optional
  if (typeof callback == 'undefined' && typeof options == 'function') {
    callback = options;
    options = {};
  }
  // Update default values
  if (!('columns' in options)) {
    options.columns = true;
  }
  if (!('limit' in options)) {
    options.limit = Number.MAX_SAFE_INTEGER;
  }

  let limit = options.limit;
  let fileStream = filesystem.createReadStream(path.resolve(filename));
  let csvParser = csv(options);
  let lastStream = csvParser;
  let aggregator;
  if ('aggregation' in options) {
    aggregator = new TimeAggregator(options['aggregation']);
    lastStream = aggregator;
  }
  lastStream
    .on('data', function (data) {
      if (limit > 0) {
        callback(null, data);
      }
      if (limit === 0) {
        fileStream.unpipe();
        fileStream.destroy();
        callback();
      }
      limit -= 1;
    })
    .once('error', callback)
    .once('close', callback)
    .once('end', callback);

  if (aggregator) {
    fileStream.pipe(csvParser).pipe(aggregator);
  } else {
    fileStream.pipe(csvParser);
  }
};

/**
 * @param {string} filename - The absolute path of the CSV file
 * @param {Object} options - Optional settings
 *                    See https://github.com/klaemo/csv-stream#options
 *                    <code>
 *                     {
 *                       delimiter: ',', // comma, semicolon, whatever
 *                       newline: 'n', // newline character
 *                       quote: '"', // what's considered a quote
 *                       empty: '', // empty fields are replaced by this,
 *
 *                       // if set to true, uses first row as keys ->
 *                       // [ { column1: value1, column2: value2 , ...]}
 *                       columns: true,
 *                       // Max Number of records to process
 *                       limit: Number.MAX_SAFE_INTEGER
 *                      }
 *                    </code>
 * @param {Function} callback - This callback will be called with the results in
 *                              the following format:
 *                              <code>function (error, stats)</code>
 *                              stats = {
 *                              	count: '100',
 *                              	fields: {
 *                              		fieldName : {
 *                              		  min: '0',
 *                              		  max: '10',
 *                              		  sum: '500',
 *                              		  mean: '5',
 *                              		  variance: '4',
 *                              		  stdev: '2'
 *                              	  }, ...
 *                              	}
 *                              }
 */
FileServer.prototype.getStatistics = function (filename, options, callback) {
  // "options" is optional
  if (typeof callback == 'undefined' && typeof options == 'function') {
    callback = options;
    options = {};
  }

  let stats = {
    count: 0,
    fields: {}
  };
  let fields = stats.fields;

  options.objectMode = true;
  this.getData(filename, options, function (error, data) {
    if (error) {
      callback(error);
      return;
    } else if (data) {
      // Update stats on every record
      stats.count++;
      for (let name in data) {
        let max, min, newMean, oldMean;
        let val = new Number(data[name]);

        if (isNaN(val)) {
          continue;
        } else {
          val = val.valueOf();
        }
        if (!(name in fields)) {
          fields[name] = {
            min: Number.MAX_VALUE,
            max: Number.MIN_VALUE,
            sum: 0.0,
            mean: val,
            variance: 0.0,
            stdev: 0.0
          };
        }

        min = fields[name].min;
        max = fields[name].max;
        fields[name].min = val < min ? val : min;
        fields[name].max = val > max ? val : max;
        fields[name].sum += val;

        // Compute variance based on online algorithm from
        // D. Knuth, The Art of Computer Programming, Vol 2, 3rd ed, p.232
        if (stats.count > 1) {
          oldMean = fields[name].mean;
          newMean = oldMean + (val - oldMean) / stats.count;
          fields[name].mean = newMean;
          fields[name].variance += (val - oldMean) * (val - newMean);
        }
      }
    } else {
      // Finished reading data
      for (let name in fields) {
        if (stats.count > 1) {
          fields[name].variance /= (stats.count - 1);
          fields[name].stdev = Math.sqrt(fields[name].variance);
        }
      }
      callback(null, stats);
      return;
    }
  });
};


// EXPORTS
module.exports = FileServer;
