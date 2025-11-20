<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

$dataFile = 'data.json';

if (!file_exists($dataFile)) {
    file_put_contents($dataFile, json_encode([
        'users' => [],
        'expenses' => []
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

$action = isset($_GET['action']) ? $_GET['action'] : null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = isset($input['action']) ? $input['action'] : null;
}

try {
    switch ($action) {
        case 'load':
            $data = json_decode(file_get_contents($dataFile), true);
            echo json_encode([
                'success' => true,
                'data' => $data
            ], JSON_UNESCAPED_UNICODE);
            break;

        case 'save':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                throw new Exception('Method not allowed');
            }

            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['data'])) {
                throw new Exception('No data provided');
            }

            $result = file_put_contents(
                $dataFile, 
                json_encode($input['data'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
            );

            if ($result === false) {
                throw new Exception('Failed to save data');
            }

            echo json_encode([
                'success' => true,
                'message' => 'Data saved successfully'
            ], JSON_UNESCAPED_UNICODE);
            break;

        default:
            throw new Exception('Invalid action');
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>