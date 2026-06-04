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

function body_line($label, $value) {
    return $label . ": " . ($value !== "" ? $value : "-") . "\n";
}

function send_site_mail($to, $subject, $body, $email = "", $attachments = []) {
    $headers = mail_headers($email);

    if (!$attachments) {
        return mail($to, $subject, $body, $headers);
    }

    $boundary = "savvy_boundary_" . md5((string) microtime(true));
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: multipart/mixed; boundary=\"" . $boundary . "\"\r\n";

    $message  = "--" . $boundary . "\r\n";
    $message .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $message .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
    $message .= $body . "\r\n";

    foreach ($attachments as $attachment) {
        $fileContents = file_get_contents($attachment["path"]);

        if ($fileContents === false) {
            continue;
        }

        $fileName = str_replace(["\"", "\r", "\n"], "", $attachment["name"]);
        $fileType = $attachment["type"];

        $message .= "--" . $boundary . "\r\n";
        $message .= "Content-Type: " . $fileType . "; name=\"" . $fileName . "\"\r\n";
        $message .= "Content-Transfer-Encoding: base64\r\n";
        $message .= "Content-Disposition: attachment; filename=\"" . $fileName . "\"\r\n\r\n";
        $message .= chunk_split(base64_encode($fileContents)) . "\r\n";
    }

    $message .= "--" . $boundary . "--";

    return @mail($to, $subject, $message, $headers);
}

function school_management_leads_url() {
    $baseUrl = getenv("SCHOOL_MANAGEMENT_API_URL");

    if ($baseUrl === false || trim($baseUrl) === "") {
        $baseUrl = "http://localhost:5000/api";
    }

    return rtrim($baseUrl, "/") . "/website-leads";
}

function forward_to_school_management($payload) {
    if (!isset($payload["source"])) {
        $payload["source"] = "savvy-mother-toddler";
    }

    $json = json_encode($payload);
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
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 1);
        curl_setopt($ch, CURLOPT_TIMEOUT, 2);

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
            "timeout" => 2,
            "ignore_errors" => true,
        ],
    ]);

    $response = @file_get_contents($url, false, $context);
    $statusLine = $http_response_header[0] ?? "";

    return $response !== false && preg_match("/\\s2\\d\\d\\s/", $statusLine);
}

function school_management_queue_path() {
    $queuePath = getenv("SCHOOL_MANAGEMENT_LEAD_QUEUE");

    if ($queuePath === false || trim($queuePath) === "") {
        $queuePath = __DIR__ . DIRECTORY_SEPARATOR . "website-leads-queue" . DIRECTORY_SEPARATOR . "pending-leads.jsonl";
    }

    return $queuePath;
}

function queue_school_management_lead($payload) {
    if (!isset($payload["source"])) {
        $payload["source"] = "savvy-mother-toddler";
    }

    $payload["queuedAt"] = gmdate("c");

    $queuePath = school_management_queue_path();
    $queueDir = dirname($queuePath);

    if (!is_dir($queueDir) && !@mkdir($queueDir, 0755, true)) {
        return false;
    }

    $json = json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    if ($json === false) {
        return false;
    }

    return @file_put_contents($queuePath, $json . PHP_EOL, FILE_APPEND | LOCK_EX) !== false;
}

function collect_photo_uploads($photoFields) {
    $allowedTypes = [
        "image/jpeg" => "jpg",
        "image/png" => "png",
        "image/webp" => "webp",
    ];
    $maxSize = 5 * 1024 * 1024;
    $attachments = [];
    $errors = [];

    foreach ($photoFields as $fieldName => $label) {
        if (!isset($_FILES[$fieldName])) {
            continue;
        }

        $file = $_FILES[$fieldName];
        $errorCode = $file["error"] ?? UPLOAD_ERR_NO_FILE;

        if ($errorCode === UPLOAD_ERR_NO_FILE) {
            continue;
        }

        if ($errorCode !== UPLOAD_ERR_OK) {
            $errors[] = $label . " upload failed.";
            continue;
        }

        if (($file["size"] ?? 0) > $maxSize) {
            $errors[] = $label . " must be 5 MB or smaller.";
            continue;
        }

        $tmpPath = $file["tmp_name"] ?? "";

        if ($tmpPath === "" || !is_uploaded_file($tmpPath)) {
            $errors[] = $label . " upload could not be verified.";
            continue;
        }

        $mimeType = "";

        if (function_exists("finfo_open")) {
            $fileInfo = finfo_open(FILEINFO_MIME_TYPE);
            if ($fileInfo) {
                $mimeType = (string) finfo_file($fileInfo, $tmpPath);
                finfo_close($fileInfo);
            }
        } elseif (function_exists("mime_content_type")) {
            $mimeType = (string) mime_content_type($tmpPath);
        }

        if (!isset($allowedTypes[$mimeType])) {
            $errors[] = $label . " must be a JPG, PNG or WEBP image.";
            continue;
        }

        $attachments[] = [
            "path" => $tmpPath,
            "name" => strtolower(str_replace(" ", "-", $label)) . "." . $allowedTypes[$mimeType],
            "type" => $mimeType,
            "label" => $label,
        ];
    }

    return [
        "attachments" => $attachments,
        "errors" => $errors,
    ];
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    header("Location: contact.html");
    exit;
}

$to = "savvymotherschool@gmail.com";
$formType = clean_text($_POST["formType"] ?? "contact");

if ($formType === "admission") {
    $academicSession     = clean_text($_POST["academicSession"] ?? "");
    $admissionNo         = clean_text($_POST["admissionNo"] ?? "");
    $registrationNo      = clean_text($_POST["registrationNo"] ?? "");
    $dateOfAdmission     = clean_text($_POST["dateOfAdmission"] ?? "");
    $admittedClass       = clean_text($_POST["admittedClass"] ?? "");
    $admissionIncharge   = clean_text($_POST["admissionIncharge"] ?? "");
    $centreHead          = clean_text($_POST["centreHead"] ?? "");

    $childFirstName      = clean_text($_POST["childFirstName"] ?? "");
    $childMiddleName     = clean_text($_POST["childMiddleName"] ?? "");
    $childLastName       = clean_text($_POST["childLastName"] ?? "");
    $childDob            = clean_text($_POST["childDob"] ?? "");
    $dobWords            = clean_text($_POST["dobWords"] ?? "");
    $childGender         = clean_text($_POST["childGender"] ?? "");
    $religion            = clean_text($_POST["religion"] ?? "");
    $nationality         = clean_text($_POST["nationality"] ?? "");
    $childId             = clean_text($_POST["childId"] ?? "");
    $birthCertificateNo  = clean_text($_POST["birthCertificateNo"] ?? "");
    $samagraId           = clean_text($_POST["samagraId"] ?? "");
    $childAadhaar        = clean_text($_POST["childAadhaar"] ?? "");
    $childBankPassbook   = clean_text($_POST["childBankPassbook"] ?? "");
    $childBankIfsc       = clean_text($_POST["childBankIfsc"] ?? "");

    $bloodGroup          = clean_text($_POST["bloodGroup"] ?? "");
    $allergies           = clean_text($_POST["allergies"] ?? "");
    $chronicAilment      = clean_text($_POST["chronicAilment"] ?? "");
    $physicalDisability  = clean_text($_POST["physicalDisability"] ?? "");
    $surgeryUndergone    = clean_text($_POST["surgeryUndergone"] ?? "");
    $specificInstruction = clean_text($_POST["specificInstruction"] ?? "");

    $residentialAddress  = clean_text($_POST["residentialAddress"] ?? "");
    $temporaryAddress    = clean_text($_POST["temporaryAddress"] ?? "");
    $permanentAddress    = clean_text($_POST["permanentAddress"] ?? "");
    if ($temporaryAddress === "" && $residentialAddress !== "") {
        $temporaryAddress = $residentialAddress;
    }
    if ($permanentAddress === "" && $residentialAddress !== "") {
        $permanentAddress = $residentialAddress;
    }
    $residentialAddress = $permanentAddress ?: $temporaryAddress;
    $residencePhone      = clean_text($_POST["residencePhone"] ?? "");
    $fatherContact       = clean_text($_POST["fatherContact"] ?? "");
    $motherContact       = clean_text($_POST["motherContact"] ?? "");
    $guardianContact     = clean_text($_POST["guardianContact"] ?? "");

    $motherName          = clean_text($_POST["motherName"] ?? "");
    $motherAge           = clean_text($_POST["motherAge"] ?? "");
    $motherBloodGroup    = clean_text($_POST["motherBloodGroup"] ?? "");
    $motherQualification = clean_text($_POST["motherQualification"] ?? "");
    $motherOccupation    = clean_text($_POST["motherOccupation"] ?? "");
    $motherDesignation   = clean_text($_POST["motherDesignation"] ?? "");
    $motherOrganisation  = clean_text($_POST["motherOrganisation"] ?? "");
    $motherOfficeAddress = clean_text($_POST["motherOfficeAddress"] ?? "");
    $motherTel           = clean_text($_POST["motherTel"] ?? "");
    $motherEmail         = clean_text($_POST["motherEmail"] ?? "");
    $motherMobile        = clean_text($_POST["motherMobile"] ?? "");
    $motherAadhaar       = clean_text($_POST["motherAadhaar"] ?? "");
    $motherBankPassbook  = clean_text($_POST["motherBankPassbook"] ?? "");
    $motherBankIfsc      = clean_text($_POST["motherBankIfsc"] ?? "");

    $fatherName          = clean_text($_POST["fatherName"] ?? "");
    $fatherAge           = clean_text($_POST["fatherAge"] ?? "");
    $fatherBloodGroup    = clean_text($_POST["fatherBloodGroup"] ?? "");
    $fatherQualification = clean_text($_POST["fatherQualification"] ?? "");
    $fatherOccupation    = clean_text($_POST["fatherOccupation"] ?? "");
    $fatherDesignation   = clean_text($_POST["fatherDesignation"] ?? "");
    $fatherOrganisation  = clean_text($_POST["fatherOrganisation"] ?? "");
    $fatherOfficeAddress = clean_text($_POST["fatherOfficeAddress"] ?? "");
    $fatherTel           = clean_text($_POST["fatherTel"] ?? "");
    $fatherEmail         = clean_text($_POST["fatherEmail"] ?? "");
    $fatherMobile        = clean_text($_POST["fatherMobile"] ?? "");
    $fatherAadhaar       = clean_text($_POST["fatherAadhaar"] ?? "");
    $fatherBankPassbook  = clean_text($_POST["fatherBankPassbook"] ?? "");
    $fatherBankIfsc      = clean_text($_POST["fatherBankIfsc"] ?? "");

    $emergencyName       = clean_text($_POST["emergencyName"] ?? "");
    $emergencyPhone      = clean_text($_POST["emergencyPhone"] ?? "");
    $parentGuardianName  = clean_text($_POST["parentGuardianName"] ?? "");
    $undertakingDate     = clean_text($_POST["undertakingDate"] ?? "");
    $undertakingAccepted = clean_text($_POST["undertakingAccepted"] ?? "");

    $documentsValues = $_POST["documents"] ?? [];
    if (!is_array($documentsValues)) {
        $documentsValues = [$documentsValues];
    }
    $documentsValues = array_filter(array_map("clean_text", $documentsValues));
    $documents = $documentsValues ? implode(", ", $documentsValues) : "-";

    $photoUploads = collect_photo_uploads([
        "childPhoto" => "Child Photo",
        "fatherPhoto" => "Father Photo",
        "motherPhoto" => "Mother Photo",
    ]);
    $photoAttachments = $photoUploads["attachments"];
    $uploadedPhotoLabels = array_map(function ($attachment) {
        return $attachment["label"];
    }, $photoAttachments);
    $uploadedPhotos = $uploadedPhotoLabels ? implode(", ", $uploadedPhotoLabels) : "-";

    $childName = trim($childFirstName . " " . $childMiddleName . " " . $childLastName);
    $primaryPhone = $fatherContact ?: ($motherContact ?: $guardianContact);
    $replyEmail = $motherEmail ?: $fatherEmail;

    if ($academicSession === "" || $admittedClass === "" || $childFirstName === "" || $childLastName === "" || $childDob === "" || $temporaryAddress === "" || $permanentAddress === "" || $primaryPhone === "" || $parentGuardianName === "" || $undertakingAccepted === "" || $photoUploads["errors"]) {
        redirect_status("admissions.html", "error", "#admission-form");
    }

    $emailSubject = "New admission form: " . ($childName ?: $admittedClass);

    $body  = "New admission form from Savvy Mother Toddler School website:\n\n";
    $body .= "Child Information\n";
    $body .= body_line("Child Name", $childName);
    $body .= body_line("Date of Birth", $childDob);
    $body .= body_line("Date of Birth in Words", $dobWords);
    $body .= body_line("Gender", $childGender);
    $body .= body_line("Religion", $religion);
    $body .= body_line("Nationality", $nationality);
    $body .= body_line("Child ID", $childId);
    $body .= body_line("Birth Certificate No.", $birthCertificateNo);
    $body .= body_line("Samagra ID", $samagraId);
    $body .= body_line("Aadhaar No.", $childAadhaar);
    $body .= body_line("Bank Passbook Account No.", $childBankPassbook);
    $body .= body_line("Bank IFSC Code", $childBankIfsc) . "\n";

    $body .= "Medical Information\n";
    $body .= body_line("Blood Group", $bloodGroup);
    $body .= body_line("Allergies", $allergies);
    $body .= body_line("Chronic Ailment", $chronicAilment);
    $body .= body_line("Physical Disability", $physicalDisability);
    $body .= body_line("Surgery Undergone", $surgeryUndergone);
    $body .= body_line("Specific Instruction", $specificInstruction) . "\n";

    $body .= "Contact Information\n";
    $body .= body_line("Temporary Address", $temporaryAddress);
    $body .= body_line("Permanent Address", $permanentAddress);
    $body .= body_line("Telephone No.", $residencePhone);
    $body .= body_line("Father Contact No.", $fatherContact);
    $body .= body_line("Mother Contact No.", $motherContact);
    $body .= body_line("Guardian Contact No.", $guardianContact) . "\n";

    $body .= "Mother Information\n";
    $body .= body_line("Name", $motherName);
    $body .= body_line("Age", $motherAge);
    $body .= body_line("Blood Group", $motherBloodGroup);
    $body .= body_line("Educational Qualification", $motherQualification);
    $body .= body_line("Occupation", $motherOccupation);
    $body .= body_line("Designation", $motherDesignation);
    $body .= body_line("Organisation", $motherOrganisation);
    $body .= body_line("Office Address", $motherOfficeAddress);
    $body .= body_line("Tel", $motherTel);
    $body .= body_line("E-mail", $motherEmail);
    $body .= body_line("Mobile", $motherMobile);
    $body .= body_line("Aadhaar No.", $motherAadhaar);
    $body .= body_line("Bank Passbook Account No.", $motherBankPassbook);
    $body .= body_line("Bank IFSC Code", $motherBankIfsc) . "\n";

    $body .= "Father Information\n";
    $body .= body_line("Name", $fatherName);
    $body .= body_line("Age", $fatherAge);
    $body .= body_line("Blood Group", $fatherBloodGroup);
    $body .= body_line("Educational Qualification", $fatherQualification);
    $body .= body_line("Occupation", $fatherOccupation);
    $body .= body_line("Designation", $fatherDesignation);
    $body .= body_line("Organisation", $fatherOrganisation);
    $body .= body_line("Office Address", $fatherOfficeAddress);
    $body .= body_line("Tel", $fatherTel);
    $body .= body_line("E-mail", $fatherEmail);
    $body .= body_line("Mobile", $fatherMobile);
    $body .= body_line("Aadhaar No.", $fatherAadhaar);
    $body .= body_line("Bank Passbook Account No.", $fatherBankPassbook);
    $body .= body_line("Bank IFSC Code", $fatherBankIfsc) . "\n";

    $body .= "Emergency\n";
    $body .= body_line("Name", $emergencyName);
    $body .= body_line("Contact No.", $emergencyPhone) . "\n";

    $body .= "Brothers / Sisters\n";
    for ($index = 1; $index <= 3; $index++) {
        $siblingName = clean_text($_POST["siblingName" . $index] ?? "");
        $siblingAge = clean_text($_POST["siblingAge" . $index] ?? "");
        $siblingClass = clean_text($_POST["siblingClass" . $index] ?? "");
        $siblingInstitution = clean_text($_POST["siblingInstitution" . $index] ?? "");

        if ($siblingName !== "" || $siblingAge !== "" || $siblingClass !== "" || $siblingInstitution !== "") {
            $body .= $index . ". " . ($siblingName ?: "-") . " | Age: " . ($siblingAge ?: "-") . " | Class: " . ($siblingClass ?: "-") . " | Institution: " . ($siblingInstitution ?: "-") . "\n";
        }
    }
    $body .= "\n";

    $body .= "Undertaking\n";
    $body .= body_line("Parent / Guardian Name", $parentGuardianName);
    $body .= body_line("Date", $undertakingDate);
    $body .= body_line("Accepted", $undertakingAccepted);
    $body .= body_line("Office Submission Note", "Please submit this form at the school office with the admission form fee.") . "\n";

    $body .= body_line("Documents Attached", $documents);
    $body .= body_line("Photo Uploads Attached", $uploadedPhotos) . "\n";

    $body .= "Office Details\n";
    $body .= body_line("Academic Session", $academicSession);
    $body .= body_line("Admission No.", $admissionNo);
    $body .= body_line("Registration No.", $registrationNo);
    $body .= body_line("Date of Admission", $dateOfAdmission);
    $body .= body_line("Admitted to Class", $admittedClass);
    $body .= body_line("Admission Incharge", $admissionIncharge);
    $body .= body_line("Centre Head", $centreHead);

    $managementLead = [
        "formType" => "admission",
        "childName" => $childName,
        "parentName" => $parentGuardianName ?: ($fatherName ?: $motherName),
        "className" => $admittedClass,
        "phone" => $primaryPhone,
        "email" => $replyEmail,
        "subject" => $emailSubject,
        "message" => $body,
        "priority" => "high",
        "payload" => [
            "academicSession" => $academicSession,
            "admissionNo" => $admissionNo,
            "registrationNo" => $registrationNo,
            "dateOfAdmission" => $dateOfAdmission,
            "admittedClass" => $admittedClass,
            "admissionIncharge" => $admissionIncharge,
            "centreHead" => $centreHead,
            "childName" => $childName,
            "childFirstName" => $childFirstName,
            "childMiddleName" => $childMiddleName,
            "childLastName" => $childLastName,
            "childDob" => $childDob,
            "dobWords" => $dobWords,
            "childGender" => $childGender,
            "religion" => $religion,
            "nationality" => $nationality,
            "childId" => $childId,
            "birthCertificateNo" => $birthCertificateNo,
            "samagraId" => $samagraId,
            "childAadhaar" => $childAadhaar,
            "childBankPassbook" => $childBankPassbook,
            "childBankIfsc" => $childBankIfsc,
            "bloodGroup" => $bloodGroup,
            "allergies" => $allergies,
            "chronicAilment" => $chronicAilment,
            "physicalDisability" => $physicalDisability,
            "surgeryUndergone" => $surgeryUndergone,
            "specificInstruction" => $specificInstruction,
            "residentialAddress" => $residentialAddress,
            "temporaryAddress" => $temporaryAddress,
            "permanentAddress" => $permanentAddress,
            "residencePhone" => $residencePhone,
            "fatherContact" => $fatherContact,
            "motherContact" => $motherContact,
            "guardianContact" => $guardianContact,
            "motherName" => $motherName,
            "motherAge" => $motherAge,
            "motherBloodGroup" => $motherBloodGroup,
            "motherQualification" => $motherQualification,
            "motherOccupation" => $motherOccupation,
            "motherDesignation" => $motherDesignation,
            "motherOrganisation" => $motherOrganisation,
            "motherOfficeAddress" => $motherOfficeAddress,
            "motherTel" => $motherTel,
            "motherEmail" => $motherEmail,
            "motherMobile" => $motherMobile,
            "motherAadhaar" => $motherAadhaar,
            "motherBankPassbook" => $motherBankPassbook,
            "motherBankIfsc" => $motherBankIfsc,
            "fatherName" => $fatherName,
            "fatherAge" => $fatherAge,
            "fatherBloodGroup" => $fatherBloodGroup,
            "fatherQualification" => $fatherQualification,
            "fatherOccupation" => $fatherOccupation,
            "fatherDesignation" => $fatherDesignation,
            "fatherOrganisation" => $fatherOrganisation,
            "fatherOfficeAddress" => $fatherOfficeAddress,
            "fatherTel" => $fatherTel,
            "fatherEmail" => $fatherEmail,
            "fatherMobile" => $fatherMobile,
            "fatherAadhaar" => $fatherAadhaar,
            "fatherBankPassbook" => $fatherBankPassbook,
            "fatherBankIfsc" => $fatherBankIfsc,
            "emergencyName" => $emergencyName,
            "emergencyPhone" => $emergencyPhone,
            "parentGuardianName" => $parentGuardianName,
            "undertakingDate" => $undertakingDate,
            "undertakingAccepted" => $undertakingAccepted,
            "officeSubmissionNote" => "Please submit this form at the school office with the admission form fee.",
            "documents" => $documents,
            "uploadedPhotos" => $uploadedPhotos,
            "emailBody" => $body,
        ],
    ];

    $savedToManagement = forward_to_school_management($managementLead);
    $queuedForManagement = $savedToManagement ? false : queue_school_management_lead($managementLead);
    $sentByEmail = send_site_mail($to, $emailSubject, $body, $replyEmail, $photoAttachments);

    if ($sentByEmail || $savedToManagement || $queuedForManagement) {
        redirect_status("admissions.html", "success", "#admission-form");
    }

    redirect_status("admissions.html", "error", "#admission-form");
}

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

    $managementLead = [
        "formType" => "enquiry",
        "childName" => $childName,
        "parentName" => $parentName,
        "className" => $classAppliedFor,
        "phone" => $phone,
        "email" => $email,
        "subject" => $emailSubject,
        "message" => $enquiryMessage,
        "priority" => "medium",
        "payload" => [
            "classAppliedFor" => $classAppliedFor,
            "childName" => $childName,
            "dob" => $dob,
            "age" => $age,
            "childGender" => $childGender,
            "parentName" => $parentName,
            "parentGender" => $parentGender,
            "address" => $address,
            "city" => $city,
            "state" => $state,
            "phone" => $phone,
            "email" => $email,
            "enquiryMessage" => $enquiryMessage,
            "heardAbout" => $heardAbout,
            "otherSource" => $otherSource,
            "emailBody" => $body,
        ],
    ];

    $savedToManagement = forward_to_school_management($managementLead);
    $queuedForManagement = $savedToManagement ? false : queue_school_management_lead($managementLead);
    $sentByEmail = @mail($to, $emailSubject, $body, mail_headers($email));

    if ($sentByEmail || $savedToManagement || $queuedForManagement) {
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

$managementLead = [
    "formType" => "contact",
    "childName" => $childName,
    "parentName" => $parentName,
    "phone" => $phone,
    "email" => $email,
    "subject" => $subject,
    "message" => $message,
    "priority" => "medium",
    "payload" => [
        "parentName" => $parentName,
        "childName" => $childName,
        "phone" => $phone,
        "email" => $email,
        "subject" => $subject,
        "message" => $message,
        "emailBody" => $body,
    ],
];

$savedToManagement = forward_to_school_management($managementLead);
$queuedForManagement = $savedToManagement ? false : queue_school_management_lead($managementLead);
$sentByEmail = @mail($to, $emailSubject, $body, mail_headers($email));

if ($sentByEmail || $savedToManagement || $queuedForManagement) {
    redirect_status("contact.html", "success");
}

redirect_status("contact.html", "error");
