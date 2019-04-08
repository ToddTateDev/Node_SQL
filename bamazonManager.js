var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 8889,
    user: "root",
    password: "root",
    database: "bamazon"
});



connection.connect(function (err) {
    if (err) throw err;
    welcomeScreen();
});

function welcomeScreen() {
    inquirer
        .prompt({
            name: "welcome",
            type: "list",
            message: "Hello! What would you like to do?",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit Application"]
        }).then(function (answer) {
            switch (answer.welcome) {
                case "View Products for Sale":
                    viewProducts();
                    break;
                case "View Low Inventory":
                    viewLowInventory();
                    break;
                case "Add to Inventory":
                    addToInventory();
                    break;
                case "Add New Product":
                    addProduct();
                    break;
                case "Exit Application":
                    connection.end();
                
            }
        })
}

function viewProducts() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        console.log(`These are the products available for sale!`);
        for (var i = 0; i < res.length; i++) {

            console.log(`ID: ${res[i].id}  || Product Name: ${res[i].product_name}  || Department: ${res[i].department_name}  || Price: $${res[i].price}  || Number Available: ${res[i].stock_quantity}\n`);
        }
        welcomeScreen();
    })
}

function viewLowInventory() {
    connection.query("SELECT * FROM products WHERE stock_quantity <= 20;", function (err, res) {
        if (err) throw err;
        // console.log(res);
        for (var i = 0; i < res.length; i++) {
            console.log(`ID: ${res[i].id}  || Product Name: ${res[i].product_name}  || Department: ${res[i].department_name}  || Price: $${res[i].price}  || Number Available: ${res[i].stock_quantity}\n`);

        }
        welcomeScreen();
    })
}

function addToInventory() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;

        for (var i = 0; i < res.length; i++) {

            console.log(`ID: ${res[i].id}  || Product Name: ${res[i].product_name}  || Department: ${res[i].department_name}  || Price: $${res[i].price}  || Number Available: ${res[i].stock_quantity}\n`);
        }
        inquirer
        .prompt([{
            name: "updateID",
            type: "input",
            message: "What's the ID of the product you'd like to update?"
        },
        {
            name: "updateQuantity",
            type: "input",
            message: "How many units would you like to add to inventory?"
        }]).then(function (answer) {
            connection.query("SELECT id, stock_quantity FROM products WHERE ?",
            {
                id: parseInt(answer.updateID)
            }, function (err, res) {
                if (err) throw err;
                var quantity = res[0].stock_quantity + parseInt(answer.updateQuantity);
                connection.query("UPDATE products SET stock_quantity = " + quantity + " WHERE ?",
                {
                    id: parseInt(answer.updateID)
                }, function (err, res) {
                    // console.log(`The quantity has been updated to ${quantity}`);
                })
                console.log(`The quantity has been updated to ${quantity}`);
                welcomeScreen();
            })
            
        })
    })

}

function addProduct() {
    inquirer
        .prompt([{
            name: "addProductName",
            type: "input",
            message: "What's the name of the Product you'd like to add?"
        },
        {
            name: "addDepartmentName",
            type: "input",
            message: "Which department will this product be stored under?"
        },
        {
            name: "addPrice",
            type: "input",
            message: "What's the price of the product?"
        },
        {
            name: "initialQuantity",
            type: "input",
            message: "What's the Initial Quantity in stock?"
        }]).then(function (answer) {
            connection.query("INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES ('" + answer.addProductName + "', '" + answer.addDepartmentName + "',  " + parseInt(answer.addPrice) + ", " + parseInt(answer.initialQuantity) + ");",
                function (err, res) {
                    if (err) throw err;
                    console.log(`Product was successfully added!`);
                    welcomeScreen();
                }

            )
        }

        )
}