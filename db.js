var mysql = require('mysql');
/*let host = (location.protocol !== 'https:') ? 'localhost' : 'db5004833077.hosting-data.io';
let user = (location.protocol !== 'https:') ? 'root' : 'dbu1296977';
let password = (location.protocol !== 'https:') ? '' : 'JVARproduction_&_0';
let database = (location.protocol !== 'https:') ? 'dbs4053752' : 'dbs4053752';*/
var connection = mysql.createConnection({
  /*host: host,
  user: user,
  password: password,
  database: database*/
  host: 'db5004833077.hosting-data.io',
  user: 'dbu1296977',
  password: 'JVARproduction_&_0',
  database: 'dbs4053752'
});


exports.con = function(){
	connection.connect();
}

exports.select = function (query, values=null) {
  let _result;
  let _error;
 
  connection.query(query,values, function (error, results, fields) {
    if (error) throw error;
    _result = results;
    _error = error;
  });
  return _result;
};

exports.update = function (query, values) {
  let _result = null;
  let _error = null;
  connection.query(query, values, function (error, results, fields) {
    if (error) throw error;
    _result = results;
    _error = error;
  });
  return _result;
};

exports.insert = function (query, values) {
  let _result = null;
  let _error = null;
  connection.query(query, values, function (error, results, fields) {
    if (error) throw error;
    _result = true;
    _error = error;
  });
  return _result;
};


exports.end = function(){
	connection.end();
}

//  JavaScript Document
