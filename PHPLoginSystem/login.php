<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="styles.css">
    <title>Login</title>
</head>
<body>
    <?php include_once("header.php") ?>

    <div class="wrapper">
        <h1>Login</h1>
        <form action="includes/login.inc.php" method="POST">
            <input type="text" name="username" placeholder="Username..." required>
            <br><br>
            <input type="password" name="password" placeholder="Password..." required>
            <br><br>
            <button type="submit" name="submit">Login</button>
        </form>

        <?php
            if(isset($_GET["error"])) {
                if($_GET["error"] == "emptyInput") {
                    echo "<p>Fill in all fields!</p>";
                }
                elseif($_GET["error"] == "stmtfailed") {
                    echo "<p>Something went wrong, try again!</p>";
                    echo "<p>Stmt failure</p>";
                }
                elseif($_GET["error"] == "wrongLogin") {
                    echo "<p>Invalid username/password!</p>";
                }
            }
        ?>
    </div>
</body>
</html>