<?php
// Conexión a BD y búsqueda del registro por id
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

// Preparar y ejecutar SELECT seguro
$stmt = $conn->prepare("SELECT id, nombre, email, edad FROM usuarios WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();

// Si no existe, redirigir con error
if ($result->num_rows === 0) {
    $stmt->close();
    $conn->close();
    header('Location: mostrar_datos.php?m=invalid');
    exit;
}

// Obtener fila para rellenar el formulario
$row = $result->fetch_assoc();
$stmt->close();
$conn->close();
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Editar Usuario</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
    <h1>Editar Usuario</h1>

    <!-- Formulario pre-llenado: envía a procesar_formulario.php (con hidden id) -->
    <form action="procesar_formulario.php" method="POST">
        <input type="hidden" name="id" value="<?php echo (int)$row['id']; ?>">

        <label for="nombre">Nombre:</label>
        <input type="text" id="nombre" name="nombre" required
               value="<?php echo htmlspecialchars($row['nombre'], ENT_QUOTES, 'UTF-8'); ?>">

        <label for="email">Email:</label>
        <input type="email" id="email" name="email" required
               value="<?php echo htmlspecialchars($row['email'], ENT_QUOTES, 'UTF-8'); ?>">

        <label for="edad">Edad:</label>
        <input type="number" id="edad" name="edad" required min="0"
               value="<?php echo (int)$row['edad']; ?>">

        <br>
        <button type="submit">Guardar cambios</button>
    </form>

    <!-- Enlace de regreso -->
    <p class="small-note"><a href="mostrar_datos.php">Volver a la lista</a></p>
    </div>
</body>
</html>