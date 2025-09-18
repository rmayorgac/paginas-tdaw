<?php
// Conexión a BD para eliminar un registro por id
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "formulario_db";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}
$conn->set_charset("utf8mb4");

// Obtener id desde GET y validar
$id = isset($_GET['id']) ? intval($_GET['id']) : 0;
if ($id <= 0) {
    header('Location: mostrar_datos.php?m=invalid');
    exit;
}

// Ejecutar DELETE seguro con prepared statement
$stmt = $conn->prepare("DELETE FROM usuarios WHERE id = ?");
$stmt->bind_param("i", $id);
if ($stmt->execute()) {
    // Redirigir con mensaje exitoso
    header('Location: mostrar_datos.php?m=deleted');
} else {
    // Registrar error y redirigir con mensaje genérico
    error_log("Error delete: " . $stmt->error);
    header('Location: mostrar_datos.php?m=error');
}
$stmt->close();
$conn->close();
exit;
?>