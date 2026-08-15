<?php
/**
 * API Inscription Utilisateur PHP (INSERT INTO users)
 * Validation : 6 caractères min, confirmation identique, unicité téléphone/email
 */
require_once __DIR__ . '/config.php';

$input = json_decode(file_get_contents('php://input'), true);

$name = trim($input['name'] ?? '');
$phone = trim($input['phone'] ?? '');
$email = trim($input['email'] ?? '');
$password = trim($input['password'] ?? '');
$confirm_password = trim($input['confirm_password'] ?? '');
$location = trim($input['location'] ?? 'Yaoundé, Cameroun');

if (empty($name) || empty($phone) || empty($password)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Le nom, le numéro de téléphone et le mot de passe sont obligatoires.'
    ]);
    exit();
}

// 1. Mot de passe de 6 caractères minimum
if (strlen($password) < 6) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Le mot de passe doit contenir au moins 6 caractères (lettres ou chiffres).'
    ]);
    exit();
}

// 2. Vérification de la confirmation du mot de passe
if (!empty($confirm_password) && $password !== $confirm_password) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Le mot de passe et la confirmation ne sont pas identiques. Le compte n\'a pas été créé.'
    ]);
    exit();
}

try {
    // 3. Vérifier si le téléphone ou l'email existe déjà
    $stmt = $pdo->prepare("SELECT id FROM users WHERE phone = ? OR (email IS NOT NULL AND email != '' AND email = ?)");
    $stmt->execute([$phone, $email]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Ce numéro de téléphone ou cet email est déjà associé à un compte.'
        ]);
        exit();
    }

    // 4. Hachage du mot de passe avec BCRYPT
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

    // 5. Insertion dans la base de données PHP
    $stmt = $pdo->prepare("
        INSERT INTO users (name, phone, email, password, location) 
        VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->execute([$name, $phone, $email ?: null, $hashedPassword, $location]);

    $userId = $pdo->lastInsertId();

    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Compte créé avec succès et enregistré dans la base de données PHP.',
        'user' => [
            'id' => (int)$userId,
            'name' => $name,
            'phone' => $phone,
            'email' => $email,
            'location' => $location
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erreur lors de l\'enregistrement en base de données : ' . $e->getMessage()
    ]);
}
?>
