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

// Mensajes breves según código en URL (?m=...)
$msg = '';
if (isset($_GET['m'])) {
    switch ($_GET['m']) {
        case 'added':   $msg = "Registro agregado."; break;
        case 'updated': $msg = "Registro actualizado."; break;
        case 'deleted': $msg = "Registro eliminado."; break;
        case 'invalid': $msg = "Datos inválidos proporcionados."; break;
        case 'error':   $msg = "Ocurrió un error. Revisa el log."; break;
    }
}

// Paginación: obtener página actual y tamaño
$page = isset($_GET['page']) ? intval($_GET['page']) : 1;
if ($page < 1) $page = 1;
$pageSize = 5; // registros por página (ajustable)

// Total de registros para calcular páginas
$totalResult = $conn->query("SELECT COUNT(*) AS c FROM usuarios");
$totalRow = $totalResult->fetch_assoc();
$total = intval($totalRow['c']);
$totalPages = $total > 0 ? intval(ceil($total / $pageSize)) : 1;
if ($page > $totalPages) $page = $totalPages;

$offset = ($page - 1) * $pageSize;

// Obtener registros solo para la página actual con LIMIT/OFFSET
$limit = intval($pageSize);
$offset = intval($offset);
$sql = "SELECT id, nombre, email, edad FROM usuarios ORDER BY id ASC LIMIT $limit OFFSET $offset";
$result = $conn->query($sql);

// Helper: construir query string manteniendo parámetros existentes
function qs($params) {
    $qs = $_GET;
    foreach ($params as $k => $v) $qs[$k] = $v;
    return http_build_query($qs);
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Usuarios Registrados</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
    <h1>Usuarios Registrados</h1>

    <!-- Mostrar mensaje si aplica -->
    <?php if ($msg): ?>
        <p><strong><?php echo htmlspecialchars($msg, ENT_QUOTES, 'UTF-8'); ?></strong></p>
    <?php endif; ?>

    <!-- Enlace para crear nuevo registro -->
    <p><a href="formulario.html">Nuevo registro</a></p>

    <!-- Si no hay registros, informar -->
    <?php if ($total === 0): ?>
        <p>No hay usuarios registrados.</p>
    <?php else: ?>
        <!-- Resumen de rango mostrado -->
        <p class="small-note">Mostrando <?php echo ($offset + 1); ?> - <?php echo min($offset + $pageSize, $total); ?> de <?php echo $total; ?> registros.</p>

        <!-- Tabla de resultados -->
        <table class="styled-table" border="1" cellpadding="6" cellspacing="0">
            <tr>
                <th>ID</th><th>Nombre</th><th>Email</th><th>Edad</th><th>Acciones</th>
            </tr>
            <!-- Iterar filas obtenidas -->
            <?php while($row = $result->fetch_assoc()): ?>
                <tr>
                    <td><?php echo (int)$row['id']; ?></td>
                    <td><?php echo htmlspecialchars($row['nombre'], ENT_QUOTES, 'UTF-8'); ?></td>
                    <td><?php echo htmlspecialchars($row['email'], ENT_QUOTES, 'UTF-8'); ?></td>
                    <td><?php echo (int)$row['edad']; ?></td>
                    <td>
                        <!-- Acciones por fila -->
                        <a href="editar.php?id=<?php echo (int)$row['id']; ?>">Editar</a>
                        |
                        <a href="eliminar.php?id=<?php echo (int)$row['id']; ?>"
                           onclick="return confirm('¿Eliminar este registro?');">Eliminar</a>
                    </td>
                </tr>
            <?php endwhile; ?>
        </table>

        <!-- Bloque de paginación: enlaces y páginas visibles -->
        <?php if ($totalPages > 1): ?>
            <div class="pagination" role="navigation" aria-label="Paginación">
                <?php if ($page > 1): ?>
                    <!-- Enlaces a primera y anterior -->
                    <a href="?<?php echo qs(['page' => 1]); ?>">&laquo; Primero</a>
                    <a href="?<?php echo qs(['page' => $page - 1]); ?>">&lsaquo; Anterior</a>
                <?php endif; ?>

                <?php
                // Rango compacto alrededor de la página actual
                $start = max(1, $page - 3);
                $end = min($totalPages, $page + 3);
                if ($start > 1) {
                    echo '<span class="dots">...</span>';
                }
                for ($p = $start; $p <= $end; $p++): 
                ?>
                    <?php if ($p == $page): ?>
                        <!-- Página actual -->
                        <span class="current"><?php echo $p; ?></span>
                    <?php else: ?>
                        <a href="?<?php echo qs(['page' => $p]); ?>"><?php echo $p; ?></a>
                    <?php endif; ?>
                <?php endfor;
                if ($end < $totalPages) {
                    echo '<span class="dots">...</span>';
                }
                ?>

                <?php if ($page < $totalPages): ?>
                    <!-- Enlaces a siguiente y último -->
                    <a href="?<?php echo qs(['page' => $page + 1]); ?>">Siguiente &rsaquo;</a>
                    <a href="?<?php echo qs(['page' => $totalPages]); ?>">Último &raquo;</a>
                <?php endif; ?>
            </div>
        <?php endif; ?>
    <?php endif; ?>

    </div>
</body>
</html>
<?php
// Cerrar conexión
$conn->close();
?>