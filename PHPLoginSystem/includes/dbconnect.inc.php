<?php

$db_server = "en1ehf30yom7txe7.cbetxkdyhwsb.us-east-1.rds.amazonaws.com";
$db_user = "ehtyhn94do06ucqz";
$db_pass = "k6z7kfad71gdecse";
$db_name = "er9o2bdne7o40997";
$conn = "";

try {
    $conn = mysqli_connect($db_server, $db_user, $db_pass, $db_name);
}
catch(mysqli_sql_exception $e) {
    echo "Errorr connecting to DB:";
    echo $e;
}

if(!$conn) {
    echo "No connection to DB:";
    echo mysqli_connect_error();
}