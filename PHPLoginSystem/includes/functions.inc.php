<?php

function emptyLoginInput($username, $password) {
    if(empty($username) || empty($password)) {
        return true;
    }
    else {
        return false;
    }
}

function emptySignupInput($username, $full_name, $email, $password, $repeat_password) {
    if(empty($username) || empty($full_name) || empty($email) || empty($password) || empty($repeat_password)) {
        return true;
    }
    else {
        return false;
    }
}

function invalidUsername($username) {
    if(!preg_match("/^\w{4,20}$/", $username)) {
        return true;
    }
    else {
        return false;
    }
}

function invalidEmail($email) {
    if(!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return true;
    }
    else {
        return false;
    }
}

function passwordsNotMatch($password, $repeat_password) {
    if($password !== $repeat_password) {
        return true;
    }
    else {
        return false;
    }
}