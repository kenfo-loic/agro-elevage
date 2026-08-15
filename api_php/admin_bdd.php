<?php
/**
 * Explorateur Web Simple de la Base de Données PHP
 */
require_once __DIR__ . '/config.php';
header('Content-Type: text/html; charset=utf-8');

$table = $_GET['table'] ?? 'users';
$allowed_tables = ['users', 'products', 'orders', 'escrow_transactions', 'notifications'];

if (!in_array($table, $allowed_tables)) {
    $table = 'users';
}

try {
    $stmt = $pdo->query("SELECT * FROM $table ORDER BY id DESC LIMIT 100");
    $rows = $stmt->fetchAll();
} catch (Exception $e) {
    $rows = [];
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Base de Données PHP — AgroElevage Link</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 20px; }
        .container { max-width: 1100px; margin: 0 auto; background: #ffffff; padding: 24px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        h1 { margin-top: 0; color: #16a34a; font-size: 22px; }
        .tabs { display: flex; gap: 8px; margin-bottom: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
        .tab-btn { text-decoration: none; padding: 8px 16px; border-radius: 6px; font-weight: 700; font-size: 13px; color: #64748b; background: #f1f5f9; }
        .tab-btn.active { background: #16a34a; color: #ffffff; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
        th { background: #f8fafc; text-align: left; padding: 10px; border-bottom: 2px solid #cbd5e1; color: #475569; }
        td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
        tr:hover { background: #f0fdf4; }
        .empty { padding: 30px; text-align: center; color: #94a3b8; font-style: italic; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Base de Données PHP (PDO) — AgroElevage Link</h1>
        
        <div class="tabs">
            <?php foreach ($allowed_tables as $t): ?>
                <a href="?table=<?= $t ?>" class="tab-btn <?= $table === $t ? 'active' : '' ?>">
                    Table : <?= strtoupper($t) ?>
                </a>
            <?php endforeach; ?>
        </div>

        <h2>Contenu de la table : <span style="color: #16a34a;"><?= strtoupper($table) ?></span></h2>

        <?php if (!empty($rows)): ?>
            <table>
                <thead>
                    <tr>
                        <?php foreach (array_keys($rows[0]) as $col): ?>
                            <th><?= htmlspecialchars($col) ?></th>
                        <?php endforeach; ?>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($rows as $row): ?>
                        <tr>
                            <?php foreach ($row as $col => $val): ?>
                                <td><?= htmlspecialchars($val ?? 'null') ?></td>
                            <?php endforeach; ?>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        <?php else: ?>
            <div class="empty">Aucun enregistrement trouvé dans la table <?= htmlspecialchars($table) ?>.</div>
        <?php endif; ?>
    </div>
</body>
</html>
