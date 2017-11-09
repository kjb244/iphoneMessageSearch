'use strict';

var exports = module.exports = {};
var path = require('path');
var security_principal = require('../database/security_principal.json');
var bcrypt = require('bcrypt');
let masterSqlQuery = "select text, "+
    "case when is_from_me =1 then 'sent' else 'received' end as sent_from, "+
    "replace(h.id, '+1','') as phone, "+
    "date + 978307200 - 18000 as dt "+
    "from message m inner join handle h on m.handle_id = h.rowid " +
    "and lower(m.text) like '%' || ? || '%' order by date ";

exports.checkLogin = function(username, rawPassword){

	return true;

	let rtn =  security_principal.filter(sp => sp.username === username);

	if (rtn.length > 0){

		return true;//bcrypt.compareSync(rawPassword, rtn[0].password);
	}

	return false;
}

function getNumResults(searchString){
	let sqlQuery = "select count(*) as cnt from (" + masterSqlQuery + ")" ;
    let sqlite3 = require('sqlite3').verbose();
    let db = new sqlite3.Database(path.join(__dirname, '../', 'database', 'iphonemessagebackup20161226.db'));
    let rowCnt = 0;
    return new Promise(function(resolve, reject){

        db.serialize(function() {
            db.each(sqlQuery, [searchString], function(err, row) {
            	rowCnt = row.cnt;
            	resolve(rowCnt);

            });

        })


    });
}



exports.getMatches = function (searchString, pagingNum, numRowsPerPage){
	pagingNum = pagingNum || 1;
	numRowsPerPage = numRowsPerPage || 200;
	let minBound = (pagingNum === 1 ? 0 : numRowsPerPage);
	let maxBound =  pagingNum * numRowsPerPage;
	return new Promise(function(resolve, reject){
        searchString = searchString.toLowerCase();

		let getNumResultsProm = getNumResults(searchString);
		getNumResultsProm.then(function(numResults){

            //ensure search text is a few characters
            let charMatch = /[A-z0-9]{3}/.test(searchString);
            if (!charMatch){
                resolve([]);
            }

            let sqlite3 = require('sqlite3').verbose();
            let db = new sqlite3.Database(path.join(__dirname, '../', 'database', 'iphonemessagebackup20161226.db'));
            let returnArr = [];
            let rowCntr = 1;
            db.serialize(function() {

                let sqlQuery = masterSqlQuery + " LIMIT " + numRowsPerPage + " OFFSET " + (pagingNum === 1 ? 1 : numRowsPerPage * pagingNum - numRowsPerPage);


                db.all(sqlQuery, [searchString], function(err, rows) {

                	for(let i=0; i<rows.length; i++){
                		let row = rows[i];
                        let startPos = row.text.toLowerCase().indexOf(searchString);
						let endPos = startPos + searchString.length;
						let splitArr = row.text.split('');
						splitArr.splice(startPos, 0, '<span class="found">');
						splitArr.splice(endPos+1, 0, '</span>');
						row.text = splitArr.join('');
                        returnArr.push({"text": row.text, "sent_received": row.sent_from, "number": row.phone, "date": row.dt});


					}
                    db.close();
                    resolve({numResults: numResults, pagingNum: pagingNum, rows: returnArr});



                });


            });

		});



	});


}