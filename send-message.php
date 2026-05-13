<?php
// Simple PHP handler for your contact form

// Only handle POST
if ($_SERVER["REQUEST_METHOD"] === "POST") {

    // Get fields
    $parentName = trim($_POST["parentName"] ?? "");
    $childName  = trim($_POST["childName"] ?? "");
    $phone      = trim($_POST["phone"] ?? "");
    $email      = trim($_POST["email"] ?? "");
    $subject    = trim($_POST["subject"] ?? "Contact form query");
    $message    = trim($_POST["message"] ?? "");

    // Basic validation
    if ($parentName === "" || $phone === "" || $message === "") {
        // Redirect back with error (basic way)
        header("Location: contact.html?status=error");
        exit;
    }

    $to = "savvymotherschool@gmail.com";

    $emailSubject = "New enquiry from website: " . $subject;

    $body  = "New enquiry from Savvy Mother Toddler School website:\n\n";
    $body .= "Parent Name: " . $parentName . "\n";
    $body .= "Child Name: " . ($childName ?: "-") . "\n";
    $body .= "Phone: " . $phone . "\n";
    $body .= "Email: " . ($email ?: "-") . "\n";
    $body .= "Subject: " . $subject . "\n\n";
    $body .= "Message:\n" . $message . "\n";

    // Email headers
    $headers  = "From: Savvy Mother Website <no-reply@savvymother.com>\r\n";
    if ($email !== "") {
        $headers .= "Reply-To: " . $email . "\r\n";
    }

    // Send email
    if (mail($to, $emailSubject, $body, $headers)) {
        // Success -> redirect back with success flag
        header("Location: contact.html?status=success");
        exit;
    } else {
        // Failed to send
        header("Location: contact.html?status=error");
        exit;
    }
} else {
    // If someone opens this file directly, just go back
    header("Location: contact.html");
    exit;
}