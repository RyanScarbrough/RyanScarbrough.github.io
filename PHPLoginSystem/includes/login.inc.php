<?php

if(isset($_POST["submit"]) && isset($_POST["username"]) && isset($_POST["password"])) {
    require_once("dbconnect.inc.php");
    require_once("functions.inc.php");

    $username = $_POST["username"];
    $password = $_POST["password"];

    if(emptyLoginInput($username, $password)) {
        header("location: ../login.php?error=emptyInput");
        exit();
    }

    $sql = "SELECT * FROM users WHERE username = ?;";

    try {
        $stmt = mysqli_stmt_init($conn);

        if(!mysqli_stmt_prepare($stmt, $sql)) {
            header("location: ../login.php?error=stmtfailed");
            exit();
        }

        mysqli_stmt_bind_param($stmt, "s", $username);
        mysqli_stmt_execute($stmt);

        $result = mysqli_stmt_get_result($stmt);

        if(mysqli_num_rows($result) > 0) {
            $row = $result->fetch_assoc();
            $db_hashed_password = $row["password_hash"];

            if(password_verify($password, $db_hashed_password))
            {
                session_start();
                session_regenerate_id();

                $_SESSION["auth"] = true;
                $_SESSION["uid"] = $row["id"];
                $_SESSION["username"] = $row["username"];

                header("location: ../index.php");
                exit();
            } else {
                // Incorrect password
                header("location: ../login.php?error=wrongLogin");
                exit();
            }
        }
        else {
            // Username doesn't exist in database
            header("location: ../login.php?error=wrongLogin");
            exit();
        }
    }
    catch(mysqli_sql_exception $e) {
            // misc. SQL error
            echo "SQL error:";
            echo "<br>";
            echo $e;
            echo "<br><br>";
    }
    finally {
        mysqli_close($conn);
    }
} else {
    header("location: ../login.php");
    exit();
}