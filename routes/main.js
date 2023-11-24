const { name } = require("ejs");

module.exports = function (app, shopData) {
  // Handle our routes

  // Route: Home Page
  app.get("/", function (req, res) {
    res.render("index.ejs", shopData);
  });

  // Route: About Page
  app.get("/about", function (req, res) {
    res.render("about.ejs", shopData);
  });
  // Route: Search Page
  app.get("/search", function (req, res) {
    res.render("search.ejs", shopData);
  });
  // Route: Search Result Page
  app.get("/search-result", function (req, res) {
    // Extract search keyword from the request
    let searchKeyword = req.query.keyword;

    // Query database for books with an exact match to the search keyword
    let sqlExactMatch = "SELECT * FROM books WHERE name = ?";
    db.query(sqlExactMatch, [searchKeyword], (err, exactMatchResult) => {
      if (err) {
        console.error(err.message);
        res.redirect("./");
      }

      // Nested route: Display search result
      app.get("/search-result", function (req, res) {
        // Display a simple message indicating the search
        res.send("You searched for: " + req.query.keyword);
      });

      // Route: Register Page
      app.get("/register", function (req, res) {
        res.render("register.ejs", shopData);
      });

      // Route: List Page
      app.get("/list", function (req, res) {
        // Query database to get all books
        let sqlquery = "SELECT * FROM books";
        // Execute SQL query
        db.query(sqlquery, (err, result) => {
          if (err) {
            res.redirect("./");
          }
          // Prepare data for rendering list.ejs
          let newData = Object.assign({}, shopData, { availableBooks: result });
          console.log(newData.availableBooks[1].name);
          res.render("list.ejs", newData);
        });
      });

      // Route: Add Book Page
      app.get("/addbook", function (req, res) {
        res.render("addbook.ejs", shopData);
      });

      // Route: Bargain Books Page
      app.get("/bargainbooks", function (req, res) {
        // Query database for books with price less than 20.00
        let sqlquery = "SELECT name, price FROM books WHERE price < 20.00";
        // Execute SQL query
        db.query(sqlquery, (err, result) => {
          if (err) {
            res.redirect("./");
          }
          // Prepare data for rendering bargainbooks.ejs
          let newData = Object.assign({}, shopData, { bargainBooks: result });
          res.render("bargainbooks.ejs", newData);
        });
      });

      // Query database for books with a partial match to the search keyword
      let sqlPartialMatch = "SELECT * FROM books WHERE name LIKE ?";
      db.query(
        sqlPartialMatch,
        [`%${searchKeyword}%`],
        (err, partialMatchResult) => {
          if (err) {
            console.error(err.message);
            res.redirect("./");
          }

          // Prepare data for rendering search-result.ejs
          let newData = Object.assign({}, shopData, {
            exactMatchBooks: exactMatchResult,
            partialMatchBooks: partialMatchResult,
          });

          // Render the search result page
          res.render("search-result.ejs", newData);
        }
      );
    });
  });

  // Route: Book Added Page
  app.post("/bookadded", function (req, res) {
    // Save data in the database
    let sqlquery = "INSERT INTO books (name, price) VALUES (?,?)";
    // Execute SQL query
    let newrecord = [req.body.name, req.body.price];
    db.query(sqlquery, newrecord, (err, result) => {
      if (err) {
        return console.error(err.message);
      } else {
        // Send a response indicating the book has been added
        res.send(
          " This book is added to the database, name: " +
            req.body.name +
            " price " +
            req.body.price
        );
      }
    });
  });

  // Route: Registered Page
  app.post("/registered", function (req, res) {
    // Save registration data in the database
    res.send(
      " Hello " +
        req.body.first +
        " " +
        req.body.last +
        " you are now registered!  We will send an email to you at " +
        req.body.email
    );
  });
};
