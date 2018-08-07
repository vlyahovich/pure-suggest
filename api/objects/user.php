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

    public function search($term, $page, $page_size)
    {
        $query = "SELECT * FROM " . $this->table_name . " WHERE (LOWER(name) REGEXP ?) OR (LOWER(domain) LIKE ?) LIMIT ?, ?;";

        $stmt = $this->conn->prepare($query);

        $term = htmlspecialchars(strip_tags($term));
        $term = trim($term);
        $term = mb_strtolower($term);

        $variants = getSearchVariants($term);

        $regexp_term = join("|", $variants);
        $term = "%{$term}%";
        $offset = ($page_size * $page) - $page_size;

        // empty request give all records
        if (!strlen($regexp_term)) {
            $regexp_term = '.';
        }

        $stmt->bindParam(1, $regexp_term);
        $stmt->bindParam(2, $term);
        $stmt->bindParam(3, $offset, PDO::PARAM_INT);
        $stmt->bindParam(4, $page_size, PDO::PARAM_INT);

        $stmt->execute();

        return $stmt;
    }
}
