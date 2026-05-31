<?php
// CLI helper: pushes queued website leads into the School Management backend.

if (PHP_SAPI !== "cli") {
    http_response_code(403);
    echo "This script can only be run from the command line.";
    exit(1);
}

function school_management_leads_url() {
    $baseUrl = getenv("SCHOOL_MANAGEMENT_API_URL");

    if ($baseUrl === false || trim($baseUrl) === "") {
        $baseUrl = "http://localhost:5000/api";
    }

    return rtrim($baseUrl, "/") . "/website-leads";
}

function school_management_queue_path() {
    $queuePath = getenv("SCHOOL_MANAGEMENT_LEAD_QUEUE");

    if ($queuePath === false || trim($queuePath) === "") {
        $queuePath = __DIR__ . DIRECTORY_SEPARATOR . "website-leads-queue" . DIRECTORY_SEPARATOR . "pending-leads.jsonl";
    }

    return $queuePath;
}

function post_lead_to_school_management($payload) {
    $json = json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    if ($json === false) {
        return false;
    }

    $url = school_management_leads_url();

    if (function_exists("curl_init")) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $json);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 2);
        curl_setopt($ch, CURLOPT_TIMEOUT, 8);

        $response = curl_exec($ch);
        $statusCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        return $response !== false && $statusCode >= 200 && $statusCode < 300;
    }

    $context = stream_context_create([
        "http" => [
            "method" => "POST",
            "header" => "Content-Type: application/json\r\n",
            "content" => $json,
            "timeout" => 8,
            "ignore_errors" => true,
        ],
    ]);

    $response = @file_get_contents($url, false, $context);
    $statusLine = $http_response_header[0] ?? "";

    return $response !== false && preg_match("/\\s2\\d\\d\\s/", $statusLine);
}

$queuePath = school_management_queue_path();

if (!is_file($queuePath)) {
    echo "No queued website leads found.\n";
    exit(0);
}

$lines = file($queuePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
if ($lines === false || count($lines) === 0) {
    echo "No queued website leads found.\n";
    exit(0);
}

$sent = 0;
$kept = [];

foreach ($lines as $line) {
    $payload = json_decode($line, true);

    if (!is_array($payload)) {
        $kept[] = $line;
        continue;
    }

    if (post_lead_to_school_management($payload)) {
        $sent++;
        continue;
    }

    $kept[] = $line;
}

if ($kept) {
    file_put_contents($queuePath, implode(PHP_EOL, $kept) . PHP_EOL, LOCK_EX);
} else {
    unlink($queuePath);
}

echo "Synced {$sent} queued lead(s). Remaining: " . count($kept) . ".\n";
