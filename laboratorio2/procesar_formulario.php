<?php
// Conexión a la base de datos
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "formulario_db";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}
$conn->set_charset("utf8mb4");

// Aceptar solo solicitudes POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: mostrar_datos.php?m=invalid');
    exit;
}

// Verificar presencia de campos esperados
if (!isset($_POST['nombre']) || !isset($_POST['email']) || !isset($_POST['edad'])) {
    header('Location: mostrar_datos.php?m=invalid');
    exit;
}

// Lectura cruda de entradas
$nombre_raw = trim($_POST['nombre']);
$email_raw  = trim($_POST['email']);
$edad_raw   = $_POST['edad']; // permitir "0"
$id         = isset($_POST['id']) ? intval($_POST['id']) : null;

// Validar no vacío en nombre y email
if ($nombre_raw === '' || $email_raw === '') {
    header('Location: mostrar_datos.php?m=invalid');
    exit;
}

// Sanitizar y validar email
$email_sanitized = filter_var($email_raw, FILTER_SANITIZE_EMAIL);
if (!filter_var($email_sanitized, FILTER_VALIDATE_EMAIL)) {
    header('Location: mostrar_datos.php?m=invalid');
    exit;
}

// Validar edad como entero >= 0
$edad_options = ["options" => ["min_range" => 0]];
$edad_valid = filter_var($edad_raw, FILTER_VALIDATE_INT, $edad_options);
if ($edad_valid === false || $edad_valid === null) {
    header('Location: mostrar_datos.php?m=invalid');
    exit;
}
$edad = intval($edad_valid);

// Preparar nombre y email (escape mínimo para almacenar)
$nombre = htmlspecialchars($nombre_raw, ENT_QUOTES, 'UTF-8');
$email = $email_sanitized;

// Si existe id -> actualizar; si no -> insertar nuevo registro
if ($id) {
    $stmt = $conn->prepare("UPDATE usuarios SET nombre = ?, email = ?, edad = ? WHERE id = ?");
    if ($stmt === false) {
        error_log("Prepare failed (update): " . $conn->error);
        header('Location: mostrar_datos.php?m=error');
        exit;
    }
    $stmt->bind_param("ssii", $nombre, $email, $edad, $id);
    if ($stmt->execute()) {
        header('Location: mostrar_datos.php?m=updated');
    } else {
        error_log("Error update: " . $stmt->error);
        header('Location: mostrar_datos.php?m=error');
    }
    $stmt->close();
} else {
    $stmt = $conn->prepare("INSERT INTO usuarios (nombre, email, edad) VALUES (?, ?, ?)");
    if ($stmt === false) {
        error_log("Prepare failed (insert): " . $conn->error);
        header('Location: mostrar_datos.php?m=error');
        exit;
    }
    $stmt->bind_param("ssi", $nombre, $email, $edad);
    if ($stmt->execute()) {
        header('Location: mostrar_datos.php?m=added');
    } else {
        error_log("Error insert: " . $stmt->error);
        header('Location: mostrar_datos.php?m=error');
    }
    $stmt->close();
}

$conn->close();
exit;
?>