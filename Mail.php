<?php
// Contact form error message
define('ERROR_MESSAGE', 'Something went wrong, please try to submit later.');

// Contact form message title
define('CONTACT_EMAIL_TITLE', 'KiDS Map list');

// Contact form success message
define('CONTACT_SUCCESS_MESSAGE', 'Thank you! We will get back to you as soon as possible.');

// define variables and set to empty values
$emailErr = $subjectErr = "";
$email = $subject = $message = $sex = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {

  if (empty($_POST["email"])) {

    $emailErr = "Email is required";

  } else {

    $email = test_input($_POST["email"]);

    // check if e-mail address is well-formed

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
      $emailErr = "Invalid email format";
    }

  }

  // Headers
  $headers  = 'MIME-Version: 1.0' . "\r\n";
  $headers .= 'Content-type: text/html; charset=utf-8' . "\r\n";
  //$headers .= 'From: ' . $name;
    
  $message_body = "";
    
  // Send mail
  mail($email, CONTACT_EMAIL_TITLE, $message_body, $headers);
}

function test_input($data) {
   $data = trim($data);
   $data = stripslashes($data);
   $data = htmlspecialchars($data);
   return $data;
}

?>
