<?php

$rawdata = file_get_contents("php://input");
$decoded = json_decode($rawdata);

$result = false;
if (strlen($rawdata) > 0) {
    $result = file_put_contents('../streams.json', $rawdata);
}

header('Content-Type: application/json; charset=utf-8');
if ($result === false) {
    http_response_code(500);
    echo '{"message": "Error"}';
} else {
    echo '{"message": "Success"}';
}
