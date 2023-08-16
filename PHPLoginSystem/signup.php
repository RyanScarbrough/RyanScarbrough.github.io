<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="styles.css">
    <title>Sign up</title>
</head>
<body>
    <?php include_once("header.php") ?>

    <div class="wrapper">
        <h1>Signup</h1>
        <form action="includes/signup.inc.php" method="POST">
            <input type="text" name="username" placeholder="Username..." required>
            <br><br>
            <input type="password" name="password" placeholder="Password..." required>
            <br><br>
            <input type="password" name="repeat_password" placeholder="Repeat password..." required>
            <br><br>
            <input type="text" name="full_name" placeholder="Full name..." required>
            <br><br>
            <input type="text" name="email" placeholder="Email..." required>
            <br><br>
            <button type="submit" name="submit">Sign up</button>
        </form>

        <?php
            if(isset($_GET["error"])) {
                if($_GET["error"] == "emptyInput") {
                    echo "<p>Fill in all fields!</p>";
                }
                elseif($_GET["error"] == "invalidUsername") {
                    echo "<p>Username must consist of letters, numbers, and underscores.</p>";
                    echo "<p>And have a length of 4 - 20.</p>";
                }
                elseif($_GET["error"] == "invalidEmail") {
                    echo "<p>Not a valid email.</p>";
                }
                elseif($_GET["error"] == "passwordsNotMatch") {
                    echo "<p>Passwords don't match.</p>";
                }
                elseif($_GET["error"] == "stmtfailed") {
                    echo "<p>Something went wrong, try again!</p>";
                    echo "<p>Stmt failure</p>";
                }
                elseif($_GET["error"] == "db-duplicate") {
                    echo "<p>" . ucfirst($_GET["type"]) . " already exists." . "</p>";
                }elseif($_GET["error"] == "none") {
                    echo "<p>You have signed up!</p>";
                }
            }
        ?>
    </div>
</body>
</html>