package com.example.onlinevegetable.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    @Autowired
    private JavaMailSender mailSender;

    public void sendOtpEmail(String email, String otp) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(email);
        message.setSubject("Password Reset OTP");

        message.setText(
                "Your password reset OTP is: " + otp +
                        "\n\nThis OTP is valid for 10 minutes." +
                        "\n\nIf you did not request a password reset, please ignore this email."
        );

        mailSender.send(message);
    }
}
