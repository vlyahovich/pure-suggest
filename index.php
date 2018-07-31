<?php
include_once dirname(__FILE__) . '/api/config/core.php';

ob_start("ob_gzhandler");

header("Cache-control: public");
header("Expires: " . gmdate("D, d M Y H:i:s", time() + 60 * 60 * 24) . " GMT");
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Suggest Demo</title>
    <link id="favicon" rel="icon" type="image/x-icon" href="favicon.ico">
    <link rel="stylesheet" href="dist/extension.css">
    <style>
        .suggest {
            width: 300px;
            display: inline-block;
            vertical-align: top;
        }

        h1 {
            font-family: -apple-system, BlinkMacSystemFont, Roboto, Helvetica Neue, sans-serif;
        }
    </style>
</head>
<body>
    <h1>Suggest demos</h1>

    <div class="suggest suggest_default">
        <input class="suggest__input" type="text" placeholder="Enter the name (default)">
    </div>

    <div class="suggest suggest_text">
        <input class="suggest__input" type="text" placeholder="Enter the name (no avatar)">
    </div>

    <div class="suggest suggest_multi">
        <input class="suggest__input" type="text" placeholder="Enter the name (multi)">
    </div>

    <script>
window.__HOST = '<?php echo $_ENV['HOST'] ?>';
window.__initialData = <?php
include_once dirname(__FILE__) . '/api/config/database.php';
include_once dirname(__FILE__) . '/api/objects/user.php';

$database = new Database();
$db = $database->getConnection();

$user = new User($db);

$stmt = $user->read();
$num = $stmt->rowCount();

if ($num > 0) {
    $users_arr = array();

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        extract($row);

        $user_item = array($id, $name, $company, $avatar);

        array_push($users_arr, $user_item);
    }

    echo json_encode($users_arr);
} else {
    echo json_encode([]);
}
?>;
    </script>
    <script src="dist/polyfills.js"></script>
    <script src="dist/extension.js"></script>
    <script src="dist/demo.js"></script>
</body>
</html>

<?php ob_end_flush();?>
