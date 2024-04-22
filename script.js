var currentPage = 'home.html';
var db;

window.addEventListener('load', function() {
    // // Open the IndexedDB database
    // var request = indexedDB.open("bookDB", 1);

    // request.onerror = function(event) {
    //     console.log('error: ' + event.target.errorCode);
    // };
    // request.onsuccess = function(event) {
    //     db = request.result;
    //     console.log('success: ' + db);
    // };

    // General page loading code
    $('#content').load('pages/home.html');
    $('.nav-link').click(function(){
        console.log('clicked');
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

    // Handle search form submission
    $('#content').on('click', '#searchButton', function(event) {
        var searchTerm = $('#searchInput').val();
        searchBooks(searchTerm); // Call the function to search books
    });

   // Handle edit button click
    $('#content').on('click', '.edit-btn', function() {
        var card = $(this).closest('.card'); 
        
        var title = card.find('.card-title').text(); 
        var author = card.find('.card-text:eq(0)').text().split(': ')[1]; 
        var keywords = card.find('.card-text:eq(1)').text().split(': ')[1]; 
        var imageSrc = card.find('.card-img').attr('src'); 
        
        // Replace the card content with editable input fields
        // Replace the card content with editable input fields
        card.html(
            '<div class="row no-gutters">' +
            '<div class="col-md-4 position-relative">' +
                '<img src="' + imageSrc + '" class="card-img" alt="Book Image">' +
                '<button type="button" class="btn btn-primary edit-image-btn">' +
                '<i class="fas fa-edit"></i>' +
                '</button>' +
            '</div>' +
            '<div class="col-md-8">' +
                '<div class="card-body">' +
                '<h5 class="card-title"><input type="text" class="form-control title-input" value="' + title + '"></h5>' +
                '<p class="card-text">Author: <input type="text" class="form-control author-input" value="' + author + '"></p>' +
                '<p class="card-text">Keywords: <input type="text" class="form-control keywords-input" value="' + keywords + '"></p>' +
                '<button type="button" class="btn btn-primary save-btn">Save</button>' +
                '</div>' +
            '</div>' +
            '</div>'
        );
  
        // Handle edit image button click
        card.find('.edit-image-btn').click(function() {
            // Open file dialog to select a new image
            var input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.click();

            input.onchange = function() {
                var imageFile = input.files[0];
                var reader = new FileReader();
                reader.onload = function(event) {
                    var imageBlob = event.target.result;
                    card.find('.card-img').attr('src', imageBlob);
                };
                reader.readAsDataURL(imageFile);
            };
        });  

        // Handle save button click
        card.find('.save-btn').click(function() {
            // Get the updated values from input fields
            var newTitle = card.find('.title-input').val();
            var newAuthor = card.find('.author-input').val();
            var newKeywords = card.find('.keywords-input').val();
            var newImage = card.find('.card-img').attr('src');

            // Save new values to the database
            var transaction = db.transaction(["books"], "readwrite");
            var objectStore = transaction.objectStore("books");

            // Search for the book with the current title
            var request = objectStore.openCursor();

            request.onsuccess = function(event) {
                var cursor = event.target.result;
                if (cursor) {
                    var book = cursor.value;
                    if (book.title === title) {
                        // Update the book with the new values
                        book.title = newTitle;
                        book.author = newAuthor;
                        book.keywords = newKeywords;
                        book.image = newImage; 
                        
                        // Save the updated book
                        var updateRequest = cursor.update(book);

                        updateRequest.onsuccess = function(event) {
                            console.log("[INFO] Book updated successfully.");

                            card.html('<div class="card mb-3">' +
                            '<div class="row no-gutters">' +
                                '<div class="col-md-4">' +
                                    '<img src="' + book.image + '" class="card-img" alt="Book Image">' +
                                '</div>' +
                                '<div class="col-md-8">' +
                                    '<div class="card-body">' +
                                        '<h5 class="card-title">' + book.title + '</h5>' +
                                        '<p class="card-text">Author: ' + book.author + '</p>' +
                                        '<p class="card-text">Keywords: ' + book.keywords + '</p>' +
                                        '<button type="button" class="btn btn-primary edit-btn">' +
                                            '<i class="fas fa-edit"></i> Edit' + 
                                        '</button>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>');
                        };

                        updateRequest.onerror = function(event) {
                            console.error("Error updating book: " + updateRequest.error);
                        };
                    } else {
                        cursor.continue();
                    }
                }
            };
        });
    });

});

function pageChanged() {
    if(currentPage == 'home.html') {
        console.log('home');
    } else if(currentPage == 'view_books.html'){
        console.log('view_books');
        var request = indexedDB.open("bookDB", 1);

        request.onerror = function(event) {
            console.log('error: ' + event.target.errorCode);
        };
        request.onsuccess = function(event) {
            db = request.result;
            console.log('success: ' + db);

            displayAllBooks(); // Call the function to display all books
        };



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

function displayAllBooks() {
    var objectStore = db.transaction("books").objectStore("books");
    var bookList = $('#bookList');

    bookList.empty(); // Clear previous search results

    objectStore.openCursor().onsuccess = function(event) {
        var cursor = event.target.result;
        if (cursor) {
            var book = cursor.value;
            var card = $('<div class="card mb-3">' +
                '<div class="row no-gutters">' +
                    '<div class="col-md-4">' +
                        '<img src="' + book.image + '" class="card-img" alt="Book Image">' +
                    '</div>' +
                    '<div class="col-md-8">' +
                        '<div class="card-body">' +
                            '<h5 class="card-title">' + book.title + '</h5>' +
                            '<p class="card-text">Author: ' + book.author + '</p>' +
                            '<p class="card-text">Keywords: ' + book.keywords + '</p>' +
                            '<button type="button" class="btn btn-primary edit-btn">' +
                                '<i class="fas fa-edit"></i> Edit' + 
                            '</button>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>');

            bookList.append(card);
            cursor.continue();
        }
    };
}

function searchBooks(searchTerm) {
    var objectStore = db.transaction("books").objectStore("books");
    var bookList = $('#bookList');

    bookList.empty(); // Clear previous search results

    objectStore.openCursor().onsuccess = function(event) {
        var cursor = event.target.result;
        if (cursor) {
            var book = cursor.value;
            // Check if the search term matches title, author, or keywords
            if (book.title.includes(searchTerm) || book.author.includes(searchTerm) || book.keywords.includes(searchTerm)) {
                var card = $('<div class="card mb-3">' +
                '<div class="row no-gutters">' +
                    '<div class="col-md-4">' +
                        '<img src="' + book.image + '" class="card-img" alt="Book Image">' +
                    '</div>' +
                    '<div class="col-md-8">' +
                        '<div class="card-body">' +
                            '<h5 class="card-title">' + book.title + '</h5>' +
                            '<p class="card-text">Author: ' + book.author + '</p>' +
                            '<p class="card-text">Keywords: ' + book.keywords + '</p>' +
                            '<button type="button" class="btn btn-primary edit-btn">' +
                                '<i class="fas fa-edit"></i> Edit' + // Edit icon from Font Awesome
                            '</button>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>');

                bookList.append(card);
            }
            cursor.continue();
        }
    };
}
