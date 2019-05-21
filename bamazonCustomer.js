//IMPORT DEPENDENCIES
var mysql = require("mysql");
var inquirer = require("inquirer");

//MYSQL CONNECTION
var connection = mysql.createConnection({
    host: "localhost",
    port: 8889,
    user: "root",
    password: "root",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    readProducts();
});

//PROGRAM FUNCTIONS
function readProducts() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        console.log(`These are the products for sale!`);
        for (var i = 0; i < res.length; i++) {

            console.log(`ID: ${res[i].id}  || Product Name: ${res[i].product_name}  || Department: ${res[i].department_name}  || Price: $${res[i].price}  || Number Available: ${res[i].stock_quantity}\n`);
        }
        buyProduct();
    })
}

function buyProduct() {
    inquirer
        .prompt([
            {
                name: "whichProductPurchase",
                type: "input",
                message: "What is the ID of the product you would like to purchase?"
            }, {
                name: "quantityToBuy",
                type: "input",
                message: "And how many would you like to purchase?"
            }]).then(function (answer) {

                connection.query("SELECT id, stock_quantity FROM products WHERE ?",
                    {
                        id: parseInt(answer.whichProductPurchase)
                    }, function (err, res) {
                        if (parseInt(answer.quantityToBuy) < res[0].stock_quantity) {
                            var updateQuantity = res[0].stock_quantity - parseInt(answer.quantityToBuy);

                            connection.query("UPDATE products SET stock_quantity = " + updateQuantity + " WHERE ?",
                                {
                                    id: parseInt(answer.whichProductPurchase)
                                }, function (err, res) {
                                    if (err) throw err;
                                    connection.query("SELECT product_name FROM products WHERE ?",
                                        {
                                            id: parseInt(answer.whichProductPurchase)
                                        }, function (err, res) {
                                            if (err) throw err;
                                            // console.log(res);
                                            console.log(`Thank you for your purchasing ${parseInt(answer.quantityToBuy)} ${res[0].product_name}`);
                                            inquirer
                                                .prompt({
                                                    name: "buySomethingElse",
                                                    type: "confirm",
                                                    message: "Would You like to make another purchase?",
                                                    default: true
                                                }).then(function (answer) {
                                                    if (answer.buySomethingElse === true) {
                                                        readProducts();
                                                    } else {
                                                        connection.end();
                                                    }
                                                })
                                        })
                                })
                        } else {
                            console.log(`I'm Sorry but we don't have enough stock to fulfill your order.`);
                            readProducts();
                        }
                    })
            })
}
