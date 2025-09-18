<?php
// Conexión básica a la base de datos para la lista rápida
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "formulario_db";

$conn = new mysqli($servername, $username, $password, $dbname);
// Verificar conexión
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}
$conn->set_charset("utf8mb4");

// Consulta para obtener todos los usuarios (lista rápida)
$sql = "SELECT id, nombre, email, edad FROM usuarios";
$result = $conn->query($sql);
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Laboratorio 2</title>
    <!-- Estilos compartidos -->
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
    <h1>Laboratorio 2</h1>

    <!-- Enlaces principales -->
    <ul>
        <li><a href="formulario.html">Nuevo usuario</a></li>
        <li><a href="mostrar_datos.php">Ver usuarios (lista completa)</a></li>
    </ul>

    <h2>Edición / Eliminación rápida</h2>

    <!-- Mostrar tabla si hay resultados -->
    <?php if ($result && $result->num_rows > 0): ?>
        <table class="styled-table" border="1" cellpadding="6" cellspacing="0">
            <tr>
                <th>ID</th><th>Nombre</th><th>Email</th><th>Edad</th><th>Acciones</th>
            </tr>
            <!-- Iterar resultados y mostrar fila por fila -->
            <?php while ($row = $result->fetch_assoc()): ?>
                <tr>
                    <td><?php echo (int)$row['id']; ?></td>
                    <!-- Escapar salida por seguridad -->
                    <td><?php echo htmlspecialchars($row['nombre'], ENT_QUOTES, 'UTF-8'); ?></td>
                    <td><?php echo htmlspecialchars($row['email'], ENT_QUOTES, 'UTF-8'); ?></td>
                    <td><?php echo (int)$row['edad']; ?></td>
                    <td>
                        <!-- Enlaces de acción: editar y eliminar -->
                        <a href="editar.php?id=<?php echo (int)$row['id']; ?>">Editar</a>
                        |
                        <a href="eliminar.php?id=<?php echo (int)$row['id']; ?>"
                           onclick="return confirm('¿Eliminar este registro?');">Eliminar</a>
                    </td>
                </tr>
            <?php endwhile; ?>
        </table>
    <?php else: ?>
        <!-- Mensaje cuando no hay registros -->
        <p>No hay usuarios registrados aún.</p>
    <?php endif; ?>

    </div>
</body>
</html>
<?php
// Cerrar conexión
$conn->close();
?>