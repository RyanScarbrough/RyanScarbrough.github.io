<?php
session_start();
session_regenerate_id();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="styles.css">
    <title>Home</title>
</head>
<body>
    <?php include_once("header.php") ?>

    <div class="wrapper">
        <h1>Home</h1>
        <?php if(isset($_SESSION["auth"])) {
            echo "<p>Welcome " . htmlspecialchars($_SESSION["username"]) . "!";
        } ?>
    </div>
</body>
</html>