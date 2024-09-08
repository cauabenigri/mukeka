

<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Conectar ao banco de dados
$host = 'localhost';
$dbname = 'login';  // Nome do banco de dados no phpMyAdmin
$user = 'root';  // Usuário do MySQL (geralmente "root" localmente)
$pass = '';  // Senha do MySQL (normalmente vazia em localhost)

$conn = new mysqli($host, $user, $pass, $dbname);

// Verificar se a conexão foi bem-sucedida
if ($conn->connect_error) {
    die('Erro de conexão: ' . $conn->connect_error);
}

// Verificar se o formulário foi submetido
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $name = $_POST['name'];
    $password = $_POST['pass'];

    // Prevenir injeção de SQL
    $name = $conn->real_escape_string($name);
    $password = $conn->real_escape_string($password);

    // Consulta para verificar se o usuário existe
    $sql = "SELECT * FROM users WHERE nome = '$name' AND senha = '$password'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        // Login bem-sucedido, redireciona para uma página de sucesso (ou exibe uma mensagem)
        header('Location: index.html?message=Login bem-sucedido!');
    } else {
        // Login falhou, redireciona de volta com uma mensagem de erro
        header('Location: index.html?message=Nome ou senha incorretos!');
    }
}

$conn->close();
?>
