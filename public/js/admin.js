let listOfFiles = [];
let aboutFile = [];
let teamFile = [];
let listCat = {
    "test": "Test",
    "partyMehndi": "Party Mehndi",
    "bestForAll": "Best For All",
    "affordable": "Affordable",
    "heavyIndian": "Heavy Indian",
    "engagementMehndi": "Engagement Mehndi",
    "bridalMehndi": "Bridal Mehndi",
    "babyShowerMehndi": "Baby Shower Mehndi",
    "aakritiMehndiClasses": "Aakriti Mehndi Classes",
    "classStudentWork": "Class Student Work",
    "about_photo": "About Photo",
};

var host = window.location.protocol + "//" + window.location.host;

console.log('host', host);

if (window.self == window.top) {
    window.dataLayer = window.dataLayer || [];
    function gtag() {
        dataLayer.push(arguments);
    }
    gtag('js', new Date());
    gtag('config', 'G-P7JSYB1CSP');

    $('#files').change(function (e) {
        var files = e.target.files;

        for (var i = 0, file; file = files[i]; i++) {
            listOfFiles.push(file);
        }
    });
    $('#aboutFile').change(function (e) {
        var files = e.target.files;

        for (var i = 0, file; file = files[i]; i++) {
            aboutFile.push(file);
        }
    });
    $('#teamfile').change(function (e) {
        var files = e.target.files;

        for (var i = 0, file; file = files[i]; i++) {
            teamFile.push(file);
        }
    });

    $('#client_phone').keyup(function (e) {//use mouseout
        if ($(this).val().indexOf('+') == 0) {
            if (this.value.length == 13) {
                e.preventDefault();
            } else if (this.value.length > 13) {
                this.value = this.value.substring(0, 13);
            }
        } else {
            $(this).val("+91" + $(this).val());
        }
    });
}

getPagination('#invoiceTableData');

function getPagination(table) {
    $(table + ' tr:eq(0)').prepend('<th> ID </th>');

    var id = 0;

    $(table + ' tr:gt(0)').each(function () {
        id++;
        $(this).prepend('<td>' + id + '</td>');
    });

    var lastPage = 1;

    $('#maxRows')
        .on('change', function (evt) {
            //$('.paginationprev').html('');						// reset pagination

            lastPage = 1;
            $('.pagination')
                .find('li')
                .slice(1, -1)
                .remove();
            var trnum = 0; // reset tr counter
            var maxRows = parseInt($(this).val()); // get Max Rows from select option

            if (maxRows == 5000) {
                $('.pagination').hide();
            } else {
                $('.pagination').show();
            }

            var totalRows = $(table + ' tbody tr').length; // numbers of rows
            $(table + ' tr:gt(0)').each(function () {
                // each TR in  table and not the header
                trnum++; // Start Counter
                if (trnum > maxRows) {
                    // if tr number gt maxRows

                    $(this).hide(); // fade it out
                }
                if (trnum <= maxRows) {
                    $(this).show();
                } // else fade in Important in case if it ..
            }); //  was fade out to fade it in
            if (totalRows > maxRows) {
                // if tr total rows gt max rows option
                var pagenum = Math.ceil(totalRows / maxRows); // ceil total(rows/maxrows) to get ..
                //	numbers of pages
                for (var i = 1; i <= pagenum;) {
                    // for each page append pagination li
                    $('.pagination #prev')
                        .before(
                            '<li data-page="' +
                            i +
                            '">\
								  <span>' +
                            i++ +
                            '<span class="sr-only">(current)</span></span>\
								</li>'
                        )
                        .show();
                } // end for i
            } // end if row count > max rows
            $('.pagination [data-page="1"]').addClass('active'); // add active class to the first li
            $('.pagination li').on('click', function (evt) {
                // on click each page
                evt.stopImmediatePropagation();
                evt.preventDefault();
                var pageNum = $(this).attr('data-page'); // get it's number

                var maxRows = parseInt($('#maxRows').val()); // get Max Rows from select option

                if (pageNum == 'prev') {
                    if (lastPage == 1) {
                        return;
                    }
                    pageNum = --lastPage;
                }
                if (pageNum == 'next') {
                    if (lastPage == $('.pagination li').length - 2) {
                        return;
                    }
                    pageNum = ++lastPage;
                }

                lastPage = pageNum;
                var trIndex = 0; // reset tr counter
                $('.pagination li').removeClass('active'); // remove active class from all li
                $('.pagination [data-page="' + lastPage + '"]').addClass('active'); // add active class to the clicked
                // $(this).addClass('active');					// add active class to the clicked
                limitPagging();
                $(table + ' tr:gt(0)').each(function () {
                    // each tr in table not the header
                    trIndex++; // tr index counter
                    // if tr index gt maxRows*pageNum or lt maxRows*pageNum-maxRows fade if out
                    if (
                        trIndex > maxRows * pageNum ||
                        trIndex <= maxRows * pageNum - maxRows
                    ) {
                        $(this).hide();
                    } else {
                        $(this).show();
                    } //else fade in
                }); // end of for each tr in table
            }); // end of on click pagination list
            limitPagging();
        })
        .val(5)
        .change();
}

function limitPagging() {
    // alert($('.pagination li').length)

    if ($('.pagination li').length > 7) {
        if ($('.pagination li.active').attr('data-page') <= 3) {
            $('.pagination li:gt(5)').hide();
            $('.pagination li:lt(5)').show();
            $('.pagination [data-page="next"]').show();
        } if ($('.pagination li.active').attr('data-page') > 3) {
            $('.pagination li:gt(0)').hide();
            $('.pagination [data-page="next"]').show();
            for (let i = (parseInt($('.pagination li.active').attr('data-page')) - 2); i <= (parseInt($('.pagination li.active').attr('data-page')) + 2); i++) {
                $('.pagination [data-page="' + i + '"]').show();

            }

        }
    }
}

function formateDates(date, opt) {
    let d = new Date(date);
    let ye = new Intl.DateTimeFormat('en', {
        year: 'numeric'
    }).format(d);
    let mo = new Intl.DateTimeFormat('en', {
        month: 'short'
    }).format(d);
    let da = new Intl.DateTimeFormat('en', {
        day: 'numeric'
    }).format(d);
    if (opt === 'save')
        return da + '-' + mo + '-' + ye;
    else
        return da + '-' + mo + '-' + ye;
}

function isNumber(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
    }
    return true;
}

var idInit = 1;

function addFieldValue() {

    var tableRef = document.getElementById('tableData').getElementsByTagName('tbody')[0];

    var row = tableRef.rows[0]; // Get the row
    var newRow = row.cloneNode(true); // Clone the row

    idParts = newRow.id.split('-');
    idInit ? idParts[1] = idInit + 1 : idInit = idParts[1]++;
    newRow.id = idParts.join('-');

    var cells = newRow.cells;
    let ids = [];
    for (var i = 0; i < cells.length; i++) {
        idParts = cells[i].id.split('-');
        ids.push(idParts[0] + '-' + idParts[2]);
        idInit ? idParts[1] = idInit + 1 : idInit = idParts[1]++;
        cells[i].id = idParts.join('-');
    }
    row.parentNode.insertBefore(newRow, row.nextSibling);
    idInit++;

    for (var i = 0; i < ids.length; i++) {
        if (ids[i] !== "1-actions") {
            let splitId = ids[i].split('-');
            let newId = idInit + '-' + splitId[1];
            document.getElementsByName(ids[i])[1].id = newId;
            document.getElementsByName(ids[i])[1].name = newId;
            document.getElementById(newId).value = " ";
        }
    }
}

function deleteFieldValue(e) {
    if (document.getElementById("tableData").rows.length > 2) {
        let i = e.parentNode.parentNode.rowIndex;
        document.getElementById("tableData").deleteRow(i);
    }
}

function calculate(e) {
    let i = e.parentNode.parentNode.rowIndex;
    var myTab = document.getElementById('tableData');

    var objCells = myTab.rows.item(i).cells;

    let person = 0;
    let price = 0;
    for (var j = 0; j < objCells.length; j++) {

        let splitId = objCells.item(j).id.split('-');
        let newId = splitId[1] + '-' + splitId[2];
        if (splitId[2] === 'person')
            person = document.getElementById(newId).value;
        if (splitId[2] === 'price')
            price = document.getElementById(newId).value;
        if (splitId[2] === 'total')
            document.getElementById(newId).value = person * price;
    }
}

function PrintData() {
    let tableLength = document.getElementById("tableData").rows.length - 1;
    var myTab = document.getElementById('tableData');
    let jsonAry = [];
    let totalPer = 0;
    let totalPrice = 0;
    for (let i = 1; i <= tableLength; i++) {
        var objCells = myTab.rows.item(i).cells;
        let person = 0;
        let price = 0;
        let json = {
            mehndi_description: "",
            no_of_person: 0,
            price_per_person: 0,
            total: 0
        };
        for (var j = 0; j < objCells.length; j++) {
            let splitId = objCells.item(j).id.split('-');
            let newId = splitId[1] + '-' + splitId[2];
            if (splitId[2] === 'description') {
                json.mehndi_description = document.getElementById(newId).value;
            }
            if (splitId[2] === 'person') {
                person = document.getElementById(newId).value;
                json.no_of_person = person;
                totalPer += Number(person);
            }
            if (splitId[2] === 'price') {
                price = document.getElementById(newId).value;
                json.price_per_person = price;

            }
            if (splitId[2] === 'total') {
                document.getElementById(newId).value = person * price;
                json.total = document.getElementById(newId).value;
                totalPrice += Number(json.total);
            }
        }
        jsonAry.push(json);
    }
    let final = {
        "billing_info": jsonAry,
        "client_name": document.getElementById('client_name').value,
        "client_phone": '+91' + document.getElementById('client_phone').value,
        "client_location": document.getElementById('client_address').value,
        "client_discount": document.getElementById('client_discount').value,
        "payment_method": document.getElementById('client_cash_mode').value,
        "total_person": totalPer,
        "total_rs": totalPrice,
        "event_date": formateDates(document.getElementById('client_event_date').value, 'print'),
    };
    if (document.getElementById('client_discount').value !== 0) {
        final.total_rs = Number(final.total_rs) - Number(document.getElementById('client_discount').value);
    }

    console.log('final', final);

    fetch(host + '/billing', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'authToken': localStorage.getItem('token')
        },
        body: JSON.stringify(final)
    })
        .then((res) => {
            return res.json();
        })
        .then((res) => {
            console.log('res', res, res._id);
            printRecord(res._id);
        })
        .catch((err) => {
            console.log('err from saving api', err);
            location.reload();
        })

}

function clearAll() {
    document.getElementById("listFilename").value = "";
    document.getElementById("files").value = "";
    listOfFiles = [];
}

function submitPhotos() {
    let len = listOfFiles.length;
    for (let i = 0; i < listOfFiles.length; i++) {
        let formData1 = new FormData();

        formData1.append("file", listOfFiles[i]);
        formData1.append("categoryName", document.getElementById('mehndiCategory').value);
        formData1.append("categoryPrintName", listCat[document.getElementById('mehndiCategory').value]);

        console.log('form', formData1);

        var apiUrl = host + "/UploadPhoto";
        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'authToken': localStorage.getItem('token')
            },
            body: formData1
        })
            .then((response) => {
                len = --len;
                return response;
            })
            .then((data) => {
                console.log('len i', len, i);

                if (len == 0) {
                    console.log('len 0 now');
                    clearAll();
                    window.location.href = '/admin';
                }
            })
            .catch((err) => {
                console.log('err i', err, i);
                len = len - i;
                if (len == 0) {
                    console.error(err);
                    clearAll();
                    window.location.href = '/admin';
                }
            });
    }
}

function deletePhoto(id) {

    var apiUrl = host + "/deletPhotosById/" + id;
    fetch(apiUrl, {
        method: 'DELETE'
    })
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            console.log("data", data);
            location.reload();
        })
        .catch((err) => {
            // Do something for an error here
            console.log("err", err);
            location.reload();
        });
}

function printRecord(id) {
    console.log('id', id);

    var apiUrl = host + "/printandpdf/" + id;
    fetch(apiUrl, {
        method: 'GET',
        headers: {
            'authToken': localStorage.getItem('token')
        },
    })
        .then((response) => {
            return response.blob();
        })
        .then((newData) => {
            saveAs(newData, 'invoice.pdf');
            location.reload();
        })
        .catch((err) => {
            console.log('err from pdf generate', err);
            location.reload();
        })
}

function deleteRecord(id) {
    console.log('id', id);

    var apiUrl = host + "/deleteRecord/" + id;
    fetch(apiUrl, {
        method: 'GET',
        headers: {
            'authToken': localStorage.getItem('token')
        },
    })
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            console.log("data", data);
            location.reload();
        })
        .catch((err) => {
            // Do something for an error here
            console.log("err", err);
            location.reload();
        });
}

function createNewCat() {
    let cat = document.getElementById('newCat').value.trim();
    let json = {
        short_name: '',
        original_name: cat
    }
    let words = cat.split(" ");

    for (i = 0; i < words.length; i++) {
        if (i == 0)
            json.short_name = json.short_name + words[i].toLowerCase();
        else {
            json.short_name = json.short_name + words[i].charAt(0).toUpperCase() + words[i].slice(1).toLowerCase();
        }
    }

    console.log('newWord', json.short_name);

    var apiUrl = host + "/category/";
    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'authToken': localStorage.getItem('token')
        },
        body: JSON.stringify(json)
    })
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            console.log("data", data);
            location.reload();
        })
        .catch((err) => {
            // Do something for an error here
            console.log("err", err);
            location.reload();
        });
}

function deleteCate() {
    let cat = document.getElementById('newMehndiCategory').value;

    console.log('cat', cat);
    var apiUrl = host + "/deleteCategory/" + cat;
    fetch(apiUrl, {
        method: 'delete',
        headers: {
            'authToken': localStorage.getItem('token')
        },
    })
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            console.log("data", data);
            location.reload();
        })
        .catch((err) => {
            // Do something for an error here
            console.log("err", err);
            location.reload();
        });
}

function checkEmailAndPWd() {
    console.log('checkEmailAndPWd');
    let json = {
        user: document.getElementById('username').value,
        pwd: document.getElementById('password').value
    };

    console.log('uer', json);

    fetch(host + '/checkUser', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(json)
    })
        .then(res => res.json())
        .then(json => {
            localStorage.setItem('token', json.authToken);
            window.location.href = host + "/admin?authToken=" + localStorage.getItem('token');
        })
        .catch((err) => {
            console.log("Error", err);
            // window.location.href = '/login';
        });
}

var loadFile = function (event) {
    var image = document.getElementById('output');
    image.src = URL.createObjectURL(event.target.files[0]);
    document.getElementById("uploadAbout").disabled = false;
}

function deleteOldAbout() {
    var apiUrl1 = host + "/deletall/about_photo";

    fetch(apiUrl1, {
        method: 'GET'
    })
        .then((response) => {
            return response;
        })
        .then((data) => {
            UploadPhoto();
        })
        .catch((err) => {
            window.location.href = '/admin';
        });
}

function UploadPhoto() {
    let formData1 = new FormData();

    formData1.append("file", aboutFile[0]);
    formData1.append("categoryName", "about_photo");
    formData1.append("categoryPrintName", listCat["about_photo"]);

    var apiUrl = host + "/UploadPhoto";
    fetch(apiUrl, {
        method: 'POST',
        body: formData1
    })
        .then((response) => {
            return response;
        })
        .then((data) => {
            clearAll();
            window.location.href = '/admin';
        })
        .catch((err) => {
            console.error(err);
            clearAll();
            window.location.href = '/admin';
        });
}