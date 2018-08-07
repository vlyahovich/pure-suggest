<?php
include_once dirname(__FILE__) . '/../config/core.php';
include_once dirname(__FILE__) . '/../config/database.php';
include_once dirname(__FILE__) . '/../objects/user.php';

header("Cache-control: no-cache");
header("Content-Type: application/json; charset=UTF-8");

$database = new Database();
$db = $database->getConnection();

$user = new User($db);

$term = isset($_GET["q"]) ? $_GET["q"] : "";
$page = isset($_GET["p"]) && is_numeric($_GET["p"]) ? $_GET["p"] : 1;
$page_size = isset($_GET["ps"]) && is_numeric($_GET["ps"]) ? $_GET["ps"] : 30;

$stmt = $user->search($term, $page, $page_size);
$num = $stmt->rowCount();

if ($num > 0) {
    $users_arr = array();

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        extract($row);

        $user_item = array($id, $name, $company, $avatar, $domain);

        array_push($users_arr, $user_item);
    }

    echo json_encode($users_arr);
} else {
    echo json_encode([]);
}
