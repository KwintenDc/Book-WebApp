var currentPage = 'home.html';
var db;

window.addEventListener('load', function() {
    // Open the IndexedDB database
    var request = indexedDB.open("bookDB", 1);

    request.onerror = function(event) {
        console.log('error: ' + event.target.errorCode);
    };
    request.onsuccess = function(event) {
        db = request.result;
        console.log('success: ' + db);
    };

    // General page loading code
    $('#content').load('pages/home.html');
    $('.nav-link').click(function(){
        $('#content').attr('data-currentPage', $(this).attr('data-page'));
        $('#content').load('pages/' + $(this).attr('data-page'));
        currentPage = document.getElementById('content').getAttribute('data-currentPage');
        pageChanged();
    });  
    $('#content').on('click', '.image-button', function(){
        $('#content').attr('data-currentPage', $(this).attr('data-page'));
        $('#content').load('pages/' + $(this).attr('data-page'));
        currentPage = document.getElementById('content').getAttribute('data-currentPage');
        pageChanged();
    });

    // Handle form submission
    $('#content').on('submit', '#uploadForm', function(event) {
        event.preventDefault(); 

        var title = $('#title').val();
        var keywords = $('#keywords').val();
        var author = $('#author').val();
        var imageFile = $('#image')[0].files[0]; 

        // Convert image file to a blob
        var reader = new FileReader();
        reader.onload = function(event) {
            var imageBlob = event.target.result;

            var transaction = db.transaction(["books"], "readwrite");
            var objectStore = transaction.objectStore("books");

            var newBook = {
                title: title,
                keywords: keywords,
                author: author,
                image: imageBlob
            };

            var addRequest = objectStore.add(newBook);

            addRequest.onsuccess = function(event) {
                console.log("[INFO] Book added to database successfully.");
            };

            addRequest.onerror = function(event) {
                console.error("Error adding book to database: " + addRequest.error);
            };
        };

        reader.readAsDataURL(imageFile); 
    });
});

function pageChanged() {
    if(currentPage == 'home.html') {
        console.log('home');
    } else if(currentPage == 'view_books.html'){
        console.log('view_books');
    } else if(currentPage == 'store_books.html'){
        if (!window.indexedDB) {
            console.log("Your browser doesn't support a stable version of IndexedDB.");
        } else {
            var request = window.indexedDB.open("bookDB", 1);
        
            request.onerror = function(event) {
                console.log('error: ' + event.target.errorCode);
            };
            request.onsuccess = function(event) {
                db = request.result;
                console.log('success: ' + db);
            };
            request.onupgradeneeded = function(event) {
                var db = event.target.result;
                
                // Create an object store (table) named 'books'
                var objectStore = db.createObjectStore("books", { autoIncrement : true });
                
                objectStore.transaction.oncomplete = (event) => {
                    console.log("[INFO] Object store 'books' created successfully.");
                };
            };
        }
    } else if(currentPage == 'qr_code.html'){
        console.log('qr_code');
    }
}

