<?php
/**
 * API Connexion Utilisateur PHP (SELECT FROM users)
 * Vérification des identifiants et du mot de passe haché BCRYPT
 */
require_once __DIR__ . '/config.php';

$input = json_decode(file_get_contents('php://input'), true);

$identifier = trim($input['identifier'] ?? $input['phone'] ?? $input['email'] ?? '');
$password = trim($input['password'] ?? '');

if (empty($identifier) || empty($password)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Veuillez saisir votre identifiant (Nom, Téléphone ou Email) et votre mot de passe.'
    ]);
    exit();
}

try {
    // Recherche de l'utilisateur par Téléphone, Email ou Nom exact
    $stmt = $pdo->prepare("SELECT * FROM users WHERE phone = ? OR email = ? OR name = ?");
    $stmt->execute([$identifier, $identifier, $identifier]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password'])) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'error' => 'Nom/Téléphone/Email ou mot de passe incorrect. Connexion refusée.'
        ]);
        exit();
    }

    // Réponse de connexion réussie
    echo json_encode([
        'success' => true,
        'message' => 'Connexion réussie.',
        'user' => [
            'id' => (int)$user['id'],
            'name' => $user['name'],
            'phone' => $user['phone'],
            'email' => $user['email'],
            'location' => $user['location'],
            'wallet_balance' => (float)$user['wallet_balance'],
            'escrow_balance' => (float)$user['escrow_balance']
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erreur de connexion : ' . $e->getMessage()
    ]);
}
?>
