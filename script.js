$(document).ready(function(){
    $('#content').load('pages/home.html');
    $('.nav-link').click(function(){
        console.log('clicked');
        $('#content').load('pages/' + $(this).attr('data-page'));
    });  
    // vvv Doesnt work yet vvv
    $('#content').on('click', '.image-button', function(){
        console.log('image clicked');
        $('#content').load('pages/' + $(this).attr('data-page'));
    });
});

var db;

window.addEventListener("load", () => {
    if (!window.indexedDB)
        console.log("IndexedDB not supported.");
    else {
        var request = window.indexedDB.open("bookstore", 1);

        request.onsuccess = (event) => {
            console.log("Database opened successfully");
            db = event.target.result;
        };

        request.onupgradeneeded = (event) => {
            console.log("Database upgrade needed");

            db = event.target.result;

            if (!db.objectStoreNames.contains("books")) {
                db.createObjectStore("books", { autoIncrement: true });
                console.log("Object store 'books' created");
            }
        };

        request.onerror = (event) => {
            console.log("Error opening database");
        };
    }

    document.getElementById("uploadForm").addEventListener("submit", (event) => {
        event.preventDefault(); // Prevent form submission

        var title = document.getElementById("title").value;
        var keywords = document.getElementById("keywords").value;
        var author = document.getElementById("author").value;
        var imageFile = document.getElementById("image").files[0];

        if (title && author && imageFile) {
            var transaction = db.transaction(["books"], "readwrite");
            var objectStore = transaction.objectStore("books");

            var bookData = {
                title: title,
                keywords: keywords,
                author: author,
                image: imageFile
            };

            var request = objectStore.add(bookData);

            request.onsuccess = () => {
                console.log("Book added to IndexedDB");
                // Reset form after successful submission
                document.getElementById("uploadForm").reset();
            };

            request.onerror = (event) => {
                console.error("Error adding book:", event.target.error);
            };
        } else {
            alert("Please fill in all fields and select an image.");
        }
    });
});

