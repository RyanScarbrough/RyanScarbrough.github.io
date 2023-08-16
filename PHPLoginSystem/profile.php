<?php
session_start();
session_regenerate_id();

if(!isset($_SESSION["auth"])) {
    header("location: index.php");
    exit();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="styles.css">
    <title>Profile</title>
</head>
<body>
    <?php include_once("header.php") ?>
    <div class="wrapper">
        <h1>Profile for <?php echo htmlspecialchars($_SESSION["username"]) ?></h1>
    </div>
</body>
</html>