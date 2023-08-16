<?php

if(isset($_POST["submit"]) && isset($_POST["username"]) && isset($_POST["password"]) &&
   isset($_POST["repeat_password"]) && isset($_POST["full_name"]) && isset($_POST["email"])) {
    require_once("dbconnect.inc.php");
    require_once("functions.inc.php");

    $username = trim($_POST["username"]);
    $full_name = $_POST["full_name"];
    $email = $_POST["email"];
    $password = $_POST["password"];
    $repeat_password = $_POST["repeat_password"];

    if(emptySignupInput($username, $full_name, $email, $password, $repeat_password)) {
        header("location: ../signup.php?error=emptyInput");
        exit();
    }
    if(invalidUsername($username)) {
        header("location: ../signup.php?error=invalidUsername");
        exit();
    }
    if(passwordsNotMatch($password, $repeat_password)) {
        header("location: ../signup.php?error=passwordsNotMatch");
        exit();
    }
    if(invalidEmail($email)) {
        header("location: ../signup.php?error=invalidEmail");
        exit();
    }

    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    $sql = "INSERT INTO users (username, password_hash, full_name, email) 
            VALUES (?, ?, ?, ?);";

    try{
        $stmt = mysqli_stmt_init($conn);

        if(!mysqli_stmt_prepare($stmt, $sql)) {
            header("location: ../signup.php?error=stmtfailed");
            exit();
        }

        mysqli_stmt_bind_param($stmt, "ssss", $username, $hashed_password, $full_name, $email);
        mysqli_stmt_execute($stmt);
        mysqli_stmt_close($stmt);

        header("location: ../signup.php?error=none");
        exit();
    }
    catch(mysqli_sql_exception $e) {
        // Duplicate username/email already in database
        if($e->getCode() == 1062) {
            $message = $e->getmessage();

            // Duplicate username found
            if(str_contains($message, "for key 'users.username'")) {
                header("location: ../signup.php?error=db-duplicate&type=username");
                exit();
            }
            // Duplicate email found
            elseif(str_contains($message, "for key 'users.email'")) {
                header("location: ../signup.php?error=db-duplicate&type=email");
                exit();
            }
        } else {
            // misc. SQL error
            echo "SQL error:";
            echo "<br>";
            echo $e;
            echo "<br><br>";
        }
    } finally {
        mysqli_close($conn);
    }
} else {
    header("location: ../signup.php");
    exit();
}