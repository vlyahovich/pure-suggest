<?php
include_once dirname(__FILE__) . '/../config/core.php';
include_once dirname(__FILE__) . '/../util/searchVariants.php';

class User
{
    private $conn;
    private $table_name;

    public $id;
    public $name;
    public $company;
    public $avatar;
    public $domain;

    public function __construct($db)
    {
        $this->table_name = $_ENV["DB_USERS_TABLE_NAME"];
        $this->conn = $db;
    }

    public function read()
    {
        $query = "SELECT * FROM " . $this->table_name . " LIMIT 1000;";

        $stmt = $this->conn->prepare($query);

        $stmt->execute();

        return $stmt;
    }

    public function search($term)
    {
        $query = "SELECT * FROM " . $this->table_name . " WHERE (LOWER(name) REGEXP ?) OR (LOWER(domain) LIKE ?) LIMIT 10;";

        $stmt = $this->conn->prepare($query);

        $term = htmlspecialchars(strip_tags($term));
        $term = trim($term);
        $term = mb_strtolower($term);

        $variants = getSearchVariants($term);

        $regexpTerm = join("|", $variants);
        $term = "%{$term}%";

        $stmt->bindParam(1, $regexpTerm);
        $stmt->bindParam(2, $term);

        $stmt->execute();

        return $stmt;
    }
}
