var ERROR = 'ERROR';
// Create or Open Database.
var db = window.openDatabase('FGWU', '1.0', 'FGWU', 20000);

// To detect whether users use mobile phones horizontally or vertically.
$(window).on('orientationchange', onOrientationChange);

// Display messages in the console.
function log(message, type = 'INFO') {
    console.log(`${new Date()} [${type}] ${message}`);
}

function onOrientationChange(e) {
    if (e.orientation == 'portrait') {
        log('Portrait.');
    }
    else {
        log('Landscape.');
    }
}

// To detect whether users open applications on mobile phones or browsers.
if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
    $(document).on('deviceready', onDeviceReady);
}
else {
    $(document).on('ready', onDeviceReady);
}

$(document).on('vclick', '#page-home #panel-open', function () {
    $('#page-home #panel').panel('open');
});

// Display errors when executing SQL queries.
function transactionError(tx, error) {
    log(`SQL Error ${error.code}. Message: ${error.message}.`, ERROR);
}

// Run this function after starting the application.
function onDeviceReady() {
    log(`Device is ready.`);

    db.transaction(function (tx) {
        // Create table ACCOUNT.
        var query = `CREATE TABLE IF NOT EXISTS Account (Id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                         Username TEXT NOT NULL UNIQUE,
                                                         Phone INTEGER NOT NULL,
                                                         Address TEXT NOT NULL,                                                       
                                                         City TEXT NOT NULL,
                                                         District TEXT NOT NULL,
                                                         Ward TEXT NOT NULL,
                                                         Type TEXT NOT NULL,
                                                         Furniture TEXT NOT NULL,
                                                         Bedroom INTEGER NOT NULL,
                                                         Price INTEGER NOT NULL,
                                                         Reporter TEXT NOT NULL,
                                                         Datetime REAL NOT NULL)`;
        tx.executeSql(query, [], function (tx, result) {
            log(`Create table 'Account' successfully.`);
        }, transactionError);

        // Create table COMMENT.
        var query = `CREATE TABLE IF NOT EXISTS Comment (Id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                         Comment TEXT NOT NULL,
                                                         Datetime REAL NOT NULL,
                                                         AccountId INTEGER NOT NULL,
                                                         FOREIGN KEY (AccountId) REFERENCES Account(Id))`;
        tx.executeSql(query, [], function (tx, result) {
            log(`Create table 'Comment' successfully.`);
        }, transactionError);
    });

    prepareDatabase(db);
}

$(document).on('pagebeforeshow', '#page-create', function () {
    importCity('#page-create #frm-register');
    importDistrict('#page-create #frm-register');
    importWard('#page-create #frm-register');
});

$(document).on('change', '#page-create #frm-register #city', function () {
    importDistrict('#page-create #frm-register', 'District', 'City');
    importWard('#page-create #frm-register', 'Ward', 'District');
});

$(document).on('change', '#page-create #frm-register #district', function () {
    importWard('#page-create #frm-register', 'Ward', 'District');
});

function importCity(form, selectedId = -1) {
    db.transaction(function (tx) {
        var query = 'SELECT * FROM City ORDER BY Name';
        tx.executeSql(query, [], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            var optionList = `<option value='-1'>Choose City</option>`;
            for (let item of result.rows) {
                optionList += `<option value='${item.Id}'' ${item.Id == selectedId ? 'selected' : ''}>${item.Name}</option>`;
            }

            $(`${form} #city`).html(optionList);
            $(`${form} #city`).selectmenu('refresh', true);
        }
    });
}

function importDistrict(form, selectedId = -1) {
    var id = $('#page-create #frm-register #city').val();

    db.transaction(function (tx) {
        var query = 'SELECT * FROM District WHERE CityId = ? ORDER BY Name';
        tx.executeSql(query, [id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            var optionList = `<option value='-1'>Choose District</option>`;
            for (let item of result.rows) {
                optionList += `<option value='${item.Id}'' ${item.Id == selectedId ? 'selected' : ''}>${item.Name}</option>`;
            }

            $(`${form} #district`).html(optionList);
            $(`${form} #district`).selectmenu('refresh', true);
        }
    });
}

function importWard(form, selectedId = ``) {
    var id = $('#page-create #frm-register #district').val();

    db.transaction(function (tx) {
        var query = 'SELECT * FROM Ward WHERE DistrictId = ? ORDER BY Name';
        tx.executeSql(query, [id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            var optionList = `<option value='-1'>Choose Ward</option>`;
            for (let item of result.rows) {
                optionList += `<option value='${item.Id}'' ${item.Id == selectedId ? 'selected' : ''}>${item.Name}</option>`;
            }

            $(`${form} #ward`).html(optionList);
            $(`${form} #ward`).selectmenu('refresh', true);
        }
    });
}


$(document).on('pagebeforeshow', '#page-create', function () {
    importType('#page-create #frm-register');
});

function importType(form, selectedId = -1) {
    db.transaction(function (tx) {
        var query = 'SELECT * FROM Type';
        tx.executeSql(query, [], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            var optionList = `<option value='-1'>Choose Type</option>`;
            for (let item of result.rows) {
                optionList += `<option value='${item.Id}'' ${item.Id == selectedId ? 'selected' : ''}>${item.Name}</option>`;
            }

            $(`${form} #type`).html(optionList);
            $(`${form} #type`).selectmenu('refresh', true);
        }
    });
}

$(document).on('pagebeforeshow', '#page-create', function () {
    importFurniture('#page-create #frm-register');
});

function importFurniture(form, selectedId = -1) {
    db.transaction(function (tx) {
        var query = 'SELECT * FROM Furniture';
        tx.executeSql(query, [], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            var optionList = `<option value='-1'>Choose Furniture</option>`;
            for (let item of result.rows) {
                optionList += `<option value='${item.Id}'' ${item.Id == selectedId ? 'selected' : ''}>${item.Name}</option>`;
            }

            $(`${form} #furniture`).html(optionList);
            $(`${form} #furniture`).selectmenu('refresh', true);
        }
    });
}

// Submit a form to register a new account.
$(document).on('submit', '#page-create #frm-register', confirmAccount);
$(document).on('submit', '#page-create #frm-confirm', registerAccount);

function confirmAccount(e) {
    e.preventDefault();

    // Get user's input.
    var username = $('#page-create #frm-register #username').val();
    var phone = $('#page-create #frm-register #phone').val();
    var address = $('#page-create #frm-register #address').val();
    var type = $('#page-create #frm-register #type option:selected').text();
    var bedroom = $('#page-create #frm-register #bedroom').val();
    var price = $('#page-create #frm-register #price').val();
    var furniture = $('#page-create #frm-register #furniture option:selected').text();
    var reporter = $('#page-create #frm-register #reporter').val();
    var city = $('#page-create #frm-register #city option:selected').text();
    var district = $('#page-create #frm-register #district option:selected').text();
    var ward = $('#page-create #frm-register #ward option:selected').text();
    // if (password != password_confirm) {
    //     var error = 'Password mismatch.';

    //     $('#page-create #error').empty().append(error);
    //     log(error, ERROR);
    // }
    // else {
    checkAccount(username, phone, address, city, district, ward, type, furniture, bedroom, price, reporter);
    // }
}

function checkAccount(username, phone, address, city, district, ward, type, furniture, bedroom, price, reporter) {
    db.transaction(function (tx) {
        var query = 'SELECT * FROM Account WHERE Username = ?';
        tx.executeSql(query, [username], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            if (result.rows[0] == null) {
                log('Open the confirmation popup.');

                $('#page-create #error').empty();

                $('#page-create #frm-confirm #username').val(username);
                $('#page-create #frm-confirm #phone').val(phone);
                $('#page-create #frm-confirm #type').val(type);
                $('#page-create #frm-confirm #bedroom').val(bedroom);
                $('#page-create #frm-confirm #price').val(price);
                $('#page-create #frm-confirm #furniture').val(furniture);
                $('#page-create #frm-confirm #reporter').val(reporter);
                $('#page-create #frm-confirm #address').val(address);
                $('#page-create #frm-confirm #city').val(city);
                $('#page-create #frm-confirm #district').val(district);
                $('#page-create #frm-confirm #ward').val(ward);

                $('#page-create #frm-confirm').popup('open');
            }
            else {
                var error = 'Account exists.';
                $('#page-create #error').empty().append(error);
                log(error, ERROR);
            }
        }
    });
}

function registerAccount(e) {
    e.preventDefault();

    var datetime = new Date();
    var username = $('#page-create #frm-confirm #username').val();
    var phone = $('#page-create #frm-confirm #phone').val();
    var type = $('#page-create #frm-confirm #type').val();
    var bedroom = $('#page-create #frm-confirm #bedroom').val();
    var price = $('#page-create #frm-confirm #price').val();
    var furniture = $('#page-create #frm-confirm #furniture').val();
    var reporter = $('#page-create #frm-confirm #reporter').val();
    var address = $('#page-create #frm-confirm #address').val();
    var city = $('#page-create #frm-confirm #city').val();
    var district = $('#page-create #frm-confirm #district').val();
    var ward = $('#page-create #frm-confirm #ward').val();

    db.transaction(function (tx) {
        var query = 'INSERT INTO Account (Username, Phone, Address, City, District, Ward, Type, Furniture, Bedroom, Price, Reporter, Datetime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        tx.executeSql(query, [username, phone, address, city, district, ward, type, furniture, bedroom, price, reporter, datetime], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Create a username '${username}' successfully.`);

            // Reset the form.
            $('#frm-register').trigger('reset');
            $('#page-create #error').empty();
            $('#username').focus();

            $('#page-create #frm-confirm').popup('close');
        }
    });
}

// Display Account List.
$(document).on('pagebeforeshow', '#page-list', showList);

function showList() {
    db.transaction(function (tx) {
        var query = 'SELECT Id, Username, City, Phone, Furniture, Price, Bedroom FROM Account';
        tx.executeSql(query, [], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Get list of accounts successfully.`);

            // Prepare the list of accounts.
            var listAccount = `<ul id='list-account' data-role='listview' data-filter='true' data-filter-placeholder='Search accounts...'
                                                     data-corners='false' class='ui-nodisc-icon ui-alt-icon'>`;
            for (let account of result.rows) {
                listAccount += `<li><a data-details='{"Id" : ${account.Id}}'>
                                    <img src='img/user-profile.png'>
                                    <h3>${account.Username}</h3>
                                    <p>${account.City}</p>
                                    <img src='img/icon-call.png' height='20px'>&nbsp;${account.Phone}&nbsp;&nbsp;
                                    <img src='img/icon-home.png' height='20px'>&nbsp;${account.Furniture}
                                    </br>
                                    <img src='img/icon-bedroom.png' height='20px'>&nbsp;${account.Bedroom}&nbsp;&nbsp;
                                    <img src='img/icon-bills.png' height='20px'>&nbsp;${account.Price}VNĐ
                                  
                                </a></li>`;
            }
            listAccount += `</ul>`;

            // Add list to UI.                                     //.listview('refresh') 
            $('#page-list #list-account').empty().append(listAccount).trigger('create');

            log(`Show list of accounts successfully.`);
        }
    });
}

// Save Account Id.
$(document).on('vclick', '#list-account li a', function (e) {
    e.preventDefault();

    var id = $(this).data('details').Id;
    localStorage.setItem('currentAccountId', id);
    $.mobile.navigate('#page-detail', { transition: 'none' });

    var commentid = $(this).data('details').CommentId;
    localStorage.setItem('currentCommentId', commentid);
});

// Show Account Details.
$(document).on('pagebeforeshow', '#page-detail', showDetail);

function showDetail() {
    var id = localStorage.getItem('currentAccountId');
    // var Datetime = new Date();
    $.mobile.navigate('#page-detail', { transition: 'none' });
    db.transaction(function (tx) {
        var query = `SELECT * FROM Account WHERE Id = ?`;
        tx.executeSql(query, [id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            var errorMessage = 'Account not found.';
            var username = errorMessage;
            var phone = errorMessage;
            var address = errorMessage;
            var city = errorMessage;
            var district = errorMessage;
            var ward = errorMessage;
            var type = errorMessage;
            var furniture = errorMessage;
            var bedroom = errorMessage;
            var price = errorMessage;
            var reporter = errorMessage;

            if (result.rows[0] != null) {
                log(`Get details of account '${id}' successfully.`);

                username = result.rows[0].Username;
                phone = result.rows[0].Phone;
                type = result.rows[0].Type;
                furniture = result.rows[0].Furniture;
                bedroom = result.rows[0].Bedroom;
                price = result.rows[0].Price;
                reporter = result.rows[0].Reporter;
                address = result.rows[0].Address;
                city = result.rows[0].City;
                district = result.rows[0].District;
                ward = result.rows[0].Ward;
                datetime = result.rows[0].Datetime;
            }
            else {
                log(errorMessage, ERROR);

                $('#page-detail #btn-update').addClass('ui-disabled');
                $('#page-detail #btn-delete-confirm').addClass('ui-disabled');
            }

            $('#page-detail #id').val(id);
            $('#page-detail #username').val(username);
            $('#page-detail #phone').val(phone);
            $('#page-detail #type').val(type);
            $('#page-detail #furniture').val(furniture);
            $('#page-detail #bedroom').val(bedroom);
            $('#page-detail #price').val(price);
            $('#page-detail #reporter').val(reporter);
            $('#page-detail #address').val(address);
            $('#page-detail #city').val(city);
            $('#page-detail #district').val(district);
            $('#page-detail #ward').val(ward);
            $('#page-detail #datetime').val(datetime);

            showComment();
        }
    });
}


// Update Account.
// $(document).on('pagebeforeshow', '#page-detail', function() {
//     importCitys('#page-detail #frm-update');
//     importDistricts('#page-detail #frm-update');
//     importWards('#page-detail #frm-update');
// });

// $(document).on('change', '#page-detail #frm-update #city', function () {
//     importDistricts('#page-detail #frm-update', 'District', 'City');
//     importWards('#page-detail #frm-update', 'Ward', 'District');
// });

// $(document).on('change', '#page-detail #frm-update #district', function () {
//     importWards('#page-detail #frm-update', 'Ward', 'District');
// });

$(document).on('pagebeforeshow', '#page-detail', function () {

    db.transaction(function (tx) {
        var id = localStorage.getItem('currentAccountId');

        var query = `SELECT Account.Username, City.Id AS CityId, District.Id AS DistrictId, Ward.Id AS WardId 
        FROM Account 
        INNER JOIN City ON City.Name = Account.City
        INNER JOIN District ON District.Name = Account.District
        INNER JOIN Ward ON Ward.Name = Account.Ward 
        WHERE Account.Id = ?`;
        tx.executeSql(query, [id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Update CITY '${result.rows[0].CityName}' successfully.`);

            importCitys('#page-detail #frm-update',result.rows[0].CityId);
            importDistricts('#page-detail #frm-update',result.rows[0].DistrictId);
            importWards('#page-detail #frm-update',result.rows[0].WardId);
        }
    });
});

function importCitys(form, selectedId = -1) {
    db.transaction(function (tx) {
        var query = 'SELECT * FROM City ORDER BY Name';
        tx.executeSql(query, [], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            var optionList = `<option value='-1'>Choose City</option>`;
            for (let item of result.rows) {
                optionList += `<option value='${item.Id}'' ${item.Id == selectedId ? 'selected' : ''}>${item.Name}</option>`;
            }

            $(`${form} #city`).html(optionList);
            $(`${form} #city`).selectmenu('refresh', true);
        }
    });
}

function importDistricts(form, selectedId = -1) {
    var id =  $(`${form} #city`).val();
    db.transaction(function (tx) {
        var query = 'SELECT * FROM District ORDER BY Name';
        tx.executeSql(query, [], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            var optionList = `<option value='-1'>Choose District</option>`;
            for (let item of result.rows) {
                optionList += `<option value='${item.Id}'' ${item.Id == selectedId ? 'selected' : ''}>${item.Name}</option>`;
            }

            $(`${form} #district`).html(optionList);
            $(`${form} #district`).selectmenu('refresh', true);
        }
    });
}

function importWards(form, selectedId = -1) {
    var id =  $(`${form} #district`).val();
    db.transaction(function (tx) {
        var query = 'SELECT * FROM Ward ORDER BY Name';
        tx.executeSql(query, [], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            var optionList = `<option value='-1'>Choose Ward</option>`;
            for (let item of result.rows) {
                optionList += `<option value='${item.Id}'' ${item.Id == selectedId ? 'selected' : ''}>${item.Name}</option>`;
            }

            $(`${form} #ward`).html(optionList);
            $(`${form} #ward`).selectmenu('refresh', true);
        }
    });
}

$(document).on('pagebeforeshow', '#page-detail', function () {
    db.transaction(function (tx) {
        var id = localStorage.getItem('currentAccountId');

        var query = `SELECT Account.Username, Type.Id AS TypeId 
        FROM Account 
        INNER JOIN Type ON Type.Name = Account.Type
        WHERE Account.Id = ?`;
        tx.executeSql(query, [id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Update TYPE '${result.rows[0].TypeName}' successfully.`);

            importTypes('#page-detail #frm-update',result.rows[0].TypeId);
        }
    });
});

function importTypes(form, selectedId = -1) {
    db.transaction(function (tx) {
        var query = 'SELECT * FROM Type';
        tx.executeSql(query, [], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            var optionList = `<option value='-1'>Choose Type</option>`;
            for (let item of result.rows) {
                optionList += `<option value='${item.Id}'' ${item.Id == selectedId ? 'selected' : ''}>${item.Name}</option>`;
            }

            $(`${form} #type`).html(optionList);
            $(`${form} #type`).selectmenu('refresh', true);
        }
    });
}

$(document).on('pagebeforeshow', '#page-detail', function () {
    db.transaction(function (tx) {
        var id = localStorage.getItem('currentAccountId');

        var query = `SELECT Account.Username, Furniture.Id AS FurnitureId 
        FROM Account 
        INNER JOIN Furniture ON Furniture.Name = Account.Furniture
        WHERE Account.Id = ?`;
        tx.executeSql(query, [id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Update FURNITURE '${result.rows[0].FurnitureName}' successfully.`);

            importFurnitures('#page-detail #frm-update',result.rows[0].FurnitureId);
        }
    });
});

function importFurnitures(form, selectedId = -1) {
    db.transaction(function (tx) {
        var query = 'SELECT * FROM Furniture';
        tx.executeSql(query, [], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            var optionList = `<option value='-1'>Choose Furniture</option>`;
            for (let item of result.rows) {
                optionList += `<option value='${item.Id}'' ${item.Id == selectedId ? 'selected' : ''}>${item.Name}</option>`;
            }

            $(`${form} #furniture`).html(optionList);
            $(`${form} #furniture`).selectmenu('refresh', true);
        }
    });
}

$(document).on('vclick', '#page-detail #frm-update #btn-update', updateAccount);

function updateAccount(e) {
    e.preventDefault();

    var id = localStorage.getItem('currentAccountId');
    var username = $('#page-detail #frm-update #username').val();
    var phone = $('#page-detail #frm-update #phone').val();
    var address = $('#page-detail #frm-update #address').val();
    var city = $('#page-detail #frm-update #city option:selected').text();
    var district = $('#page-detail #frm-update #district option:selected').text();
    var ward = $('#page-detail #frm-update #ward option:selected').text();
    var type = $('#page-detail #frm-update #type option:selected').text();
    var furniture = $('#page-detail #frm-update #furniture option:selected').text();
    var bedroom = $('#page-detail #frm-update #bedroom').val();
    var price = $('#page-detail #frm-update #price').val();
    var reporter = $('#page-detail #frm-update #reporter').val();
    var datetime = new Date();

    db.transaction(function (tx) {
        var query = 'UPDATE Account SET  Username = ?, Phone = ?, Address = ?, City = ?, District = ?, Ward = ?, Type = ?, Furniture = ?, Bedroom = ?, Price = ?, Reporter = ?, Datetime = ? WHERE Id = ?';
        tx.executeSql(query, [username, phone, address, city, district, ward, type, furniture, bedroom, price, reporter, datetime, id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Update account '${id}' and '${username}' and '${city}' and '${district}' and '${ward}' successfully.`);

            $('#page-detail #username').val(username);
            $('#page-detail #phone').val(phone);
            $('#page-detail #address').val(address);
            $('#page-detail #city').val(city);
            $('#page-detail #district').val(district);
            $('#page-detail #ward').val(ward);
            $('#page-detail #type').val(type);
            $('#page-detail #furniture').val(furniture);
            $('#page-detail #bedroom').val(bedroom);
            $('#page-detail #price').val(price);
            $('#page-detail #reporter').val(reporter);
            $('#page-detail #datetime').val(datetime);

            $('#page-detail #frm-update').trigger('reset');
            $.mobile.navigate('#page-detail', { transition: 'none' });
        }
    });
}


// Delete Account.
$(document).on('submit', '#page-detail #frm-delete', deleteAccount);
$(document).on('keyup', '#page-detail #frm-delete #txt-delete', confirmDeleteAccount);

function confirmDeleteAccount() {
    var text = $('#page-detail #frm-delete #txt-delete').val();

    if (text == 'confirm delete') {
        $('#page-detail #frm-delete #btn-delete').removeClass('ui-disabled');
    }
    else {
        $('#page-detail #frm-delete #btn-delete').addClass('ui-disabled');
    }
}

function deleteAccount(e) {
    e.preventDefault();

    var id = localStorage.getItem('currentAccountId');

    db.transaction(function (tx) {
        var query = 'DELETE FROM Account WHERE Id = ?';
        tx.executeSql(query, [id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Delete account '${id}' successfully.`);

            $('#page-detail #frm-delete').trigger('reset');

            $.mobile.navigate('#page-list', { transition: 'none' });
        }
    });
}


// Add Comment.
$(document).on('submit', '#page-detail #frm-comment', addComment);

function addComment(e) {
    e.preventDefault();

    var accountId = localStorage.getItem('currentAccountId');
    var comment = $('#page-detail #frm-comment #txt-comment').val();
    var dateTime = new Date();

    db.transaction(function (tx) {
        var query = 'INSERT INTO Comment (AccountId, Comment, Datetime) VALUES (?, ?, ?)';
        tx.executeSql(query, [accountId, comment, dateTime], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Add new comment to account '${accountId}' successfully.`);

            $('#page-detail #frm-comment').trigger('reset');

            showComment();
        }
    });
}


// Delete Comment.
$(document).on('submit', '#page-detail #frm-deletes', deleteComment);
$(document).on('keyup', '#page-detail #frm-deletes #txt-deletes', confirmDeleteComment);

function confirmDeleteComment() {
    var text = $('#page-detail #frm-deletes #txt-deletes').val();

    if (text == 'delete') {
        $('#page-detail #frm-deletes #btn-deletes').removeClass('ui-disabled');
    }
    else {
        $('#page-detail #frm-deletes #btn-deletes').addClass('ui-disabled');
    }
}

function deleteComment(e) {
    e.preventDefault();

    var id = localStorage.getItem('currentAccountId');

    db.transaction(function (tx) {
        var query = 'DELETE FROM Comment WHERE AccountId = ?';
        tx.executeSql(query, [id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Delete comment '${id}' successfully.`);

            $('#page-detail #frm-deletes').trigger('reset');

            $.mobile.navigate('#page-list', { transition: 'none' });
        }
    });
}


// Show Comment.
function showComment() {
    var accountId = localStorage.getItem('currentAccountId');

    db.transaction(function (tx) {
        var query = 'SELECT * FROM Comment WHERE AccountId = ?';
        tx.executeSql(query, [accountId], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Get list of comments successfully.`);

            // Prepare the list of comments.
            var listComment = '';
            for (let comment of result.rows) {
                listComment += `<div class = 'list'>
                                    <small>${comment.Datetime}</small>
                                    <h3>${comment.Comment}</h3>
                                </div>`;
            }

            // Add list to UI.
            $('#list-comment').empty().append(listComment);

            log(`Show list of comments successfully.`);
        }
    });
}


// Search.
$(document).on('pagebeforeshow', '#page-search', function () {
    importCityss('#page-search #frm-search');
    importDistrictss('#page-search #frm-search');
    importWardss('#page-search #frm-search');
});

$(document).on('change', '#page-search #frm-search #city', function () {
    importDistrictss('#page-search #frm-search', 'District', 'City');
    importWardss('#page-search #frm-search', 'Ward', 'District');
});

$(document).on('change', '#page-search #frm-search #district', function () {
    importWardss('#page-search #frm-search', 'Ward', 'District');
});

function importCityss(form, selectedId = -1) {
    db.transaction(function (tx) {
        var query = 'SELECT * FROM City ORDER BY Name';
        tx.executeSql(query, [], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            var optionList = `<option value='-1'>Choose City</option>`;
            for (let item of result.rows) {
                optionList += `<option value='${item.Id}'' ${item.Id == selectedId ? 'selected' : ''}>${item.Name}</option>`;
            }

            $(`${form} #city`).html(optionList);
            $(`${form} #city`).selectmenu('refresh', true);
        }
    });
}

function importDistrictss(form, selectedId = -1) {
    var id = $('#page-search #frm-search #city').val();

    db.transaction(function (tx) {
        var query = 'SELECT * FROM District WHERE CityId = ? ORDER BY Name';
        tx.executeSql(query, [id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            var optionList = `<option value='-1'>Choose District</option>`;
            for (let item of result.rows) {
                optionList += `<option value='${item.Id}'' ${item.Id == selectedId ? 'selected' : ''}>${item.Name}</option>`;
            }

            $(`${form} #district`).html(optionList);
            $(`${form} #district`).selectmenu('refresh', true);
        }
    });
}

function importWardss(form, selectedId = -1) {
    var id = $('#page-search #frm-search #district').val();

    db.transaction(function (tx) {
        var query = 'SELECT * FROM Ward WHERE DistrictId = ? ORDER BY Name';
        tx.executeSql(query, [id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            var optionList = `<option value='-1'>Choose Ward</option>`;
            for (let item of result.rows) {
                optionList += `<option value='${item.Id}'' ${item.Id == selectedId ? 'selected' : ''}>${item.Name}</option>`;
            }

            $(`${form} #ward`).html(optionList);
            $(`${form} #ward`).selectmenu('refresh', true);
        }
    });
}


$(document).on('pagebeforeshow', '#page-search', function () {
    importTypess('#page-search #frm-search');
});

function importTypess(form, selectedId = -1) {
    db.transaction(function (tx) {
        var query = 'SELECT * FROM Type';
        tx.executeSql(query, [], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            var optionList = `<option value='-1'>Choose Type</option>`;
            for (let item of result.rows) {
                optionList += `<option value='${item.Id}'' ${item.Id == selectedId ? 'selected' : ''}>${item.Name}</option>`;
            }

            $(`${form} #type`).html(optionList);
            $(`${form} #type`).selectmenu('refresh', true);
        }
    });
}

$(document).on('pagebeforeshow', '#page-search', function () {
    importFurnituress('#page-search #frm-search');
});

function importFurnituress(form, selectedId = -1) {
    db.transaction(function (tx) {
        var query = 'SELECT * FROM Furniture';
        tx.executeSql(query, [], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            var optionList = `<option value='-1'>Choose Furniture</option>`;
            for (let item of result.rows) {
                optionList += `<option value='${item.Id}'' ${item.Id == selectedId ? 'selected' : ''}>${item.Name}</option>`;
            }

            $(`${form} #furniture`).html(optionList);
            $(`${form} #furniture`).selectmenu('refresh', true);
        }
    });
}


$(document).on('submit', '#page-search #frm-search', search);

function refresh() {
    window.location.reload("Refresh");
}

function search(e) {
    e.preventDefault();

    var username = $('#page-search #frm-search #username').val();
    var phone = $('#page-search #frm-search #phone').val();
    var city = $('#page-search #frm-search #city option:selected').text();
    var district = $('#page-search #frm-search #district option:selected').text();
    var ward = $('#page-search #frm-search #ward option:selected').text();
    var type = $('#page-search #frm-search #type option:selected').text();
    var furniture = $('#page-search #frm-search #furniture option:selected').text();
    var bedroom = $('#page-search #frm-search #bedroom').val();
    var reporter = $('#page-search #frm-search #reporter').val();
    var price = $('#page-search #frm-search #price').val();

    db.transaction(function (tx) {
        var query = `SELECT Id, Username, Phone, City, District, Ward, Type, Furniture, Bedroom, Reporter, Price FROM Account WHERE`;

        if (username) {
            query += ` Username LIKE "%${username}%"   AND`;
        }

        if (phone) {
            query += ` Phone = "${phone}"   AND`;
        }

        if (city && city != "Choose City") {
            query += ` City = "${city}"   AND`;
        }

        if (district && district != "Choose District") {
            query += ` District = "${district}"   AND`;
        }

        if (ward && ward != "Choose Ward") {
            query += ` Ward = "${ward}"   AND`;
        }

        if (type && type != "Choose Type") {
            query += ` Type = "${type}"   AND`;
        }

        if (furniture && furniture != "Choose Furniture") {
            query += ` Furniture = "${furniture}"   AND`;
        }

        if (bedroom) {
            query += ` Bedroom = "${bedroom}"   AND`;
        }

        if (price) {
            query += ` Price >= "${price}"   AND`;
        }

        if (reporter) {
            query += ` Reporter = "%${reporter}%"   AND`;
        }

        query = query.substring(0, query.length - 6);

        tx.executeSql(query, [], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Get list of accounts successfully.`);

            // Prepare the list of accounts.
            var listAccount = `<ul id='list-account' data-role='listview' class='ui-nodisc-icon ui-alt-icon'>`;
            for (let account of result.rows) {
                listAccount += `<li><br/><a data-details='{"Id" : ${account.Id}}'>
                                    <img src='img/user-profile.png' style='margin: 10px'>
                                    <h3>${account.Username}</h3>
                                    <div>
                                        <img src='img/icon-call.png' height='20px'>&nbsp;${account.Phone}
                                    </div>
                                </a></li>`;
            }
            listAccount += `</ul>`;

            // Add list to UI.                                       //.listview('refresh')
            $('#page-search #list-account').empty().append(listAccount).trigger('create');

            log(`Show list of accounts successfully.`);
        }
    });
}