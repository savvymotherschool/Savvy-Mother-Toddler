<?php
// Simple PHP handler for contact and enquiry forms.

function clean_text($value) {
    return trim(str_replace(["\r", "\n", "\0"], " ", (string) $value));
}

function redirect_status($page, $status, $anchor = "") {
    header("Location: " . $page . "?status=" . urlencode($status) . $anchor);
    exit;
}

function mail_headers($email) {
    $headers = "From: Savvy Mother Website <no-reply@savvymother.com>\r\n";

    if ($email !== "" && filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $headers .= "Reply-To: " . $email . "\r\n";
    }

    return $headers;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    header("Location: contact.html");
    exit;
}

$to = "savvymotherschool@gmail.com";
$formType = clean_text($_POST["formType"] ?? "contact");

if ($formType === "enquiry") {
    $classAppliedFor = clean_text($_POST["classAppliedFor"] ?? "");
    $childName       = clean_text($_POST["childName"] ?? "");
    $dob             = clean_text($_POST["dob"] ?? "");
    $age             = clean_text($_POST["age"] ?? "");
    $childGender     = clean_text($_POST["childGender"] ?? "");
    $parentName      = clean_text($_POST["parentName"] ?? "");
    $parentGender    = clean_text($_POST["parentGender"] ?? "");
    $address         = clean_text($_POST["address"] ?? "");
    $city            = clean_text($_POST["city"] ?? "");
    $state           = clean_text($_POST["state"] ?? "");
    $phone           = clean_text($_POST["phone"] ?? "");
    $email           = clean_text($_POST["email"] ?? "");
    $enquiryMessage  = clean_text($_POST["enquiryMessage"] ?? "");
    $otherSource     = clean_text($_POST["otherSource"] ?? "");

    $heardAboutValues = $_POST["hearAbout"] ?? [];
    if (!is_array($heardAboutValues)) {
        $heardAboutValues = [$heardAboutValues];
    }
    $heardAboutValues = array_filter(array_map("clean_text", $heardAboutValues));
    $heardAbout = $heardAboutValues ? implode(", ", $heardAboutValues) : "-";

    if ($classAppliedFor === "" || $childName === "" || $parentName === "" || $phone === "" || $enquiryMessage === "") {
        redirect_status("downloads.html", "error", "#enquiry-form");
    }

    $emailSubject = "New enquiry form: " . $classAppliedFor;

    $body  = "New enquiry form from Savvy Mother Toddler School website:\n\n";
    $body .= "Class Applied For: " . $classAppliedFor . "\n\n";
    $body .= "Child Information\n";
    $body .= "Child's Name: " . $childName . "\n";
    $body .= "Date of Birth: " . ($dob ?: "-") . "\n";
    $body .= "Age: " . ($age ?: "-") . "\n";
    $body .= "Child's Gender: " . ($childGender ?: "-") . "\n\n";
    $body .= "Parent's Information\n";
    $body .= "Parent's Name: " . $parentName . "\n";
    $body .= "Parent's Gender: " . ($parentGender ?: "-") . "\n";
    $body .= "Address: " . ($address ?: "-") . "\n";
    $body .= "City: " . ($city ?: "-") . "\n";
    $body .= "State: " . ($state ?: "-") . "\n";
    $body .= "Number: " . $phone . "\n";
    $body .= "Email Address: " . ($email ?: "-") . "\n";
    $body .= "Enquiry: " . $enquiryMessage . "\n\n";
    $body .= "How Did You Hear About Us?: " . $heardAbout . "\n";
    $body .= "Other Source: " . ($otherSource ?: "-") . "\n";

    if (mail($to, $emailSubject, $body, mail_headers($email))) {
        redirect_status("downloads.html", "success", "#enquiry-form");
    }

    redirect_status("downloads.html", "error", "#enquiry-form");
}

$parentName = clean_text($_POST["parentName"] ?? "");
$childName  = clean_text($_POST["childName"] ?? "");
$phone      = clean_text($_POST["phone"] ?? "");
$email      = clean_text($_POST["email"] ?? "");
$subject    = clean_text($_POST["subject"] ?? "Contact form query");
$message    = clean_text($_POST["message"] ?? "");

if ($parentName === "" || $phone === "" || $message === "") {
    redirect_status("contact.html", "error");
}

$emailSubject = "New enquiry from website: " . $subject;

$body  = "New enquiry from Savvy Mother Toddler School website:\n\n";
$body .= "Parent Name: " . $parentName . "\n";
$body .= "Child Name: " . ($childName ?: "-") . "\n";
$body .= "Phone: " . $phone . "\n";
$body .= "Email: " . ($email ?: "-") . "\n";
$body .= "Subject: " . $subject . "\n\n";
$body .= "Message:\n" . $message . "\n";

if (mail($to, $emailSubject, $body, mail_headers($email))) {
    redirect_status("contact.html", "success");
}

redirect_status("contact.html", "error");
