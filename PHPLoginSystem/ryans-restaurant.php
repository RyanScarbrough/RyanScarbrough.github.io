<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ryan's Yummy Restaurant</title>
</head>

<?php 
    // Menu array for food items and their price
    $menuItemsToPrice = [
        "Pizza" => 12.00,
        "Tacos" => 9.99,
        "Pancakes" => 11.99,
        "Hamburger" => 15.00,
        "Toast" => 5.00,
        "Milk" => 2.50,
    ];
?>

<body>
    <h1>Ryan's Yummy Restaurant</h1>
    <p>Welcome to your new favorite place!</p>

    <a href="ryans-restaurant.php"><button>Refresh</button></a>

    <h2>Menu:</h2>
    <?php
        // Echo each food item and price from the menu array
        foreach($menuItemsToPrice as $item => $price) {
            $priceString = number_format($price, 2, ".", ",");

            echo "<p>" . "{$item} - \${$priceString}" . "</p>";
        }
    ?>

    <h2>Order:</h2>
    <form action="ryans-restaurant.php" method="get">
        <label>Item Name</label><br>
        <input type="text" name="itemName" placeholder="Pizza"><br><br>
        <label>Quantity</label><br>
        <input type="text" name="quantity"><br><br>
        <label>Free drink?</label><br>
        <label><input type="radio" name="freeDrink" value="yes"> Yes </label><br>
        <label><input type="radio" name="freeDrink" value="no"> No </label><br><br>

        <input type="submit" name="order" value="Order">
    </form>

    <?php

    // If order form was submitted
    if(isset($_GET["order"])) {
        // Sanitize input
        $quantity = filter_input(INPUT_GET, "quantity", FILTER_SANITIZE_SPECIAL_CHARS);
        $itemName = filter_input(INPUT_GET, "itemName", FILTER_SANITIZE_SPECIAL_CHARS);
        $freeDrink = filter_input(INPUT_GET, "freeDrink", FILTER_SANITIZE_SPECIAL_CHARS);
        
        // Format item name input to match menu array's item names
        $itemName = strtolower($itemName);
        $itemName = ucfirst($itemName);

        // If food item is NOT in menu array
        if(empty($menuItemsToPrice[$itemName])) {
            echo "<p>" . "Invalid food name. Please enter food name exactly as seen in menu." . "</p>";
        }
        // Else if quantity input is NOT a number
        elseif(is_numeric($quantity) == false) {
            echo "<p>" . "Please enter a number for quanitity." . "</p>";
        }
        // Else if user didn't select if they wanted a free drink
        elseif(empty($freeDrink)) {
            echo $freeDrink;
            echo "<p>" . "Please select if you want a free drink." . "</p>";
        }
        // Else calculate the total cost based on item cost and quantity
        else {
            $totalCost = $menuItemsToPrice[$itemName] * $quantity;
            $totalCostString = number_format($totalCost, 2, ".", ",");

            echo "<p>" . "You have ordered {$quantity}x {$itemName}/s" . "</p>";
            echo "<p>" . "Total cost: \${$totalCostString}" . "</p>";
            if($freeDrink == "yes") {
                echo "<p>" . "Enjoy your free drink!" . "</p>";
            }
        }
    }

    ?>
</body>
</html>