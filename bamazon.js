var mysql = require('mysql');
var inquirer = require("inquirer");
var Table = require('cli-table');

var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'bamazon_db',
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connect as id" + connection.threadId);
    displayProducts();
});

function displayProducts() {
    connection.query('SELECT * FROM products', function (err, res) {
        if (err) throw err;
        var table = new Table({
            head: ["Item ID", "Product", "Department", "Price", "Amount"],
            colWidths: [10, 30, 30, 10, 10]
        });

        for (var i = 0; i < res.length; i++) {
            table.push(
                [res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity]
            );
        };
        console.log(table.toString());
        purchase();
    });
};

function purchase() {
    inquirer.prompt([
        {
            type: "input",
            name: "product_id",
            message: "Please input the ID of the product you would like to purchase: "
        },
        {
            type: "input",
            name: "units",
            message: "How many units of this product wouold you like to purchase?"
        },
    ]).then(function (answers) {
        var prod = answers.product_id;
        var amount = answers.units;
        order(prod, amount);
    });
};

function order(product_id, amnt) {
    connection.query('SELECT * FROM products WHERE item_id = ' + product_id, function (err, res) {
        if (err) throw err;

        if (amnt <= res[0].stock_quantity) {
            var cost = res[0].price * amnt;
            console.log("Your purchase of " + amnt + " " + res[0].product_name + "(s)" + "is " + "$" + cost);
            connection.query("UPDATE products SET stock_quantity = stock_quantity - " + amnt + " WHERE item_id = " + product_id + ".")
        }
        else {
            console.log("Insufficient quantity!")
        };
    });
};