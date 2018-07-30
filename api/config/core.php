<?php
include_once dirname(__FILE__) . '/../../vendor/autoload.php';

ini_set('display_errors', 1);
error_reporting(E_ALL);

if (!isset($_ENV["DB_HOST"])) {
    $dotenv = new Dotenv\Dotenv(__DIR__, '../../.env');
    $dotenv->load();
}
