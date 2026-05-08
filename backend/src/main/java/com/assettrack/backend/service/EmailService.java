package com.assettrack.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

/**
 * Service responsible for sending HTML email notifications.
 *
 * Configured to use Mailtrap (SMTP) via application.properties.
 * All sends are @Async so they never block the calling thread
 * (especially important for the scheduler and real-time allocation flow).
 *
 * Member 5 note: wire this into WarrantyScheduler and NotificationService.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    // ── Public send helpers ───────────────────────────────────────────────────

    /**
     * Send a warranty-expiring-soon alert to an admin/manager.
     *
     * @param toEmail        recipient email
     * @param recipientName  recipient full name (for greeting)
     * @param assetSerial    asset serial number
     * @param daysLeft       days until warranty expires
     */
    @Async
    public void sendWarrantyExpiringSoonAlert(String toEmail,
                                              String recipientName,
                                              String assetSerial,
                                              long daysLeft) {
        String subject = "⚠️ Warranty Expiring Soon — " + assetSerial;
        String body = buildWarrantyExpiringSoonHtml(recipientName, assetSerial, daysLeft);
        sendHtmlEmail(toEmail, subject, body);
    }

    /**
     * Send a warranty-already-expired alert.
     */
    @Async
    public void sendWarrantyExpiredAlert(String toEmail,
                                         String recipientName,
                                         String assetSerial,
                                         long daysExpired) {
        String subject = "🚨 Warranty EXPIRED — " + assetSerial;
        String body = buildWarrantyExpiredHtml(recipientName, assetSerial, daysExpired);
        sendHtmlEmail(toEmail, subject, body);
    }

    /**
     * Send a notification that an asset has been assigned to a user.
     */
    @Async
    public void sendAssetAssignedNotification(String toEmail,
                                               String recipientName,
                                               String assetSerial,
                                               String assetBrand,
                                               String assetModel) {
        String subject = "📦 Asset Assigned to You — " + assetSerial;
        String body = buildAssetAssignedHtml(recipientName, assetSerial, assetBrand, assetModel);
        sendHtmlEmail(toEmail, subject, body);
    }

    /**
     * Send a condition report alert to admins/managers.
     */
    @Async
    public void sendConditionReportAlert(String toEmail,
                                          String recipientName,
                                          String assetSerial,
                                          String conditionStatus,
                                          String reporterName,
                                          String description) {
        String subject = "🔧 Condition Report Filed — " + assetSerial;
        String body = buildConditionReportHtml(recipientName, assetSerial,
                conditionStatus, reporterName, description);
        sendHtmlEmail(toEmail, subject, body);
    }

    // ── Core send logic ───────────────────────────────────────────────────────

    private void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // true = HTML
            helper.setFrom("noreply@assettrack.com");
            mailSender.send(message);
            log.info("Email sent to {} — Subject: {}", to, subject);
        } catch (MessagingException e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    // ── HTML templates ────────────────────────────────────────────────────────

    private String buildWarrantyExpiringSoonHtml(String name, String serial, long daysLeft) {
        return """
                <!DOCTYPE html>
                <html>
                  <body style="font-family: Arial, sans-serif; background:#f4f4f4; padding:20px;">
                    <div style="max-width:600px; margin:auto; background:#fff; border-radius:8px;
                                padding:30px; border-left:4px solid #f59e0b;">
                      <h2 style="color:#f59e0b;">⚠️ Warranty Expiring Soon</h2>
                      <p>Hi <strong>%s</strong>,</p>
                      <p>The following asset's warranty will expire in <strong>%d day(s)</strong>:</p>
                      <table style="border-collapse:collapse; width:100%%;">
                        <tr><td style="padding:8px; font-weight:bold;">Serial Number:</td>
                            <td style="padding:8px;">%s</td></tr>
                        <tr style="background:#fff7ed;">
                            <td style="padding:8px; font-weight:bold;">Days Remaining:</td>
                            <td style="padding:8px; color:#d97706; font-weight:bold;">%d days</td></tr>
                      </table>
                      <p style="margin-top:20px;">Please take action: renew the warranty, reassign as a spare,
                         or plan for decommission.</p>
                      <p style="color:#9ca3af; font-size:12px;">AssetTrack — Automated Notification</p>
                    </div>
                  </body>
                </html>
                """.formatted(name, daysLeft, serial, daysLeft);
    }

    private String buildWarrantyExpiredHtml(String name, String serial, long daysExpired) {
        return """
                <!DOCTYPE html>
                <html>
                  <body style="font-family: Arial, sans-serif; background:#f4f4f4; padding:20px;">
                    <div style="max-width:600px; margin:auto; background:#fff; border-radius:8px;
                                padding:30px; border-left:4px solid #ef4444;">
                      <h2 style="color:#ef4444;">🚨 Warranty Expired</h2>
                      <p>Hi <strong>%s</strong>,</p>
                      <p>The warranty for the following asset <strong>expired %d day(s) ago</strong>:</p>
                      <table style="border-collapse:collapse; width:100%%;">
                        <tr><td style="padding:8px; font-weight:bold;">Serial Number:</td>
                            <td style="padding:8px;">%s</td></tr>
                        <tr style="background:#fef2f2;">
                            <td style="padding:8px; font-weight:bold;">Status:</td>
                            <td style="padding:8px; color:#dc2626; font-weight:bold;">EXPIRED</td></tr>
                      </table>
                      <p style="margin-top:20px;">Suggested actions: reassign as spare, repair, or decommission.</p>
                      <p style="color:#9ca3af; font-size:12px;">AssetTrack — Automated Notification</p>
                    </div>
                  </body>
                </html>
                """.formatted(name, daysExpired, serial);
    }

    private String buildAssetAssignedHtml(String name, String serial,
                                           String brand, String model) {
        return """
                <!DOCTYPE html>
                <html>
                  <body style="font-family: Arial, sans-serif; background:#f4f4f4; padding:20px;">
                    <div style="max-width:600px; margin:auto; background:#fff; border-radius:8px;
                                padding:30px; border-left:4px solid #3b82f6;">
                      <h2 style="color:#3b82f6;">📦 Asset Assigned to You</h2>
                      <p>Hi <strong>%s</strong>,</p>
                      <p>A new asset has been assigned to you in AssetTrack:</p>
                      <table style="border-collapse:collapse; width:100%%;">
                        <tr><td style="padding:8px; font-weight:bold;">Serial Number:</td>
                            <td style="padding:8px;">%s</td></tr>
                        <tr style="background:#eff6ff;">
                            <td style="padding:8px; font-weight:bold;">Brand / Model:</td>
                            <td style="padding:8px;">%s %s</td></tr>
                      </table>
                      <p style="margin-top:20px;">Log in to AssetTrack to view details and report any condition issues.</p>
                      <p style="color:#9ca3af; font-size:12px;">AssetTrack — Automated Notification</p>
                    </div>
                  </body>
                </html>
                """.formatted(name, serial, brand, model);
    }

    private String buildConditionReportHtml(String name, String serial,
                                             String conditionStatus,
                                             String reporterName, String description) {
        return """
                <!DOCTYPE html>
                <html>
                  <body style="font-family: Arial, sans-serif; background:#f4f4f4; padding:20px;">
                    <div style="max-width:600px; margin:auto; background:#fff; border-radius:8px;
                                padding:30px; border-left:4px solid #8b5cf6;">
                      <h2 style="color:#8b5cf6;">🔧 Condition Report Filed</h2>
                      <p>Hi <strong>%s</strong>,</p>
                      <p>A condition report has been submitted for an asset that requires your attention:</p>
                      <table style="border-collapse:collapse; width:100%%;">
                        <tr><td style="padding:8px; font-weight:bold;">Serial Number:</td>
                            <td style="padding:8px;">%s</td></tr>
                        <tr style="background:#f5f3ff;">
                            <td style="padding:8px; font-weight:bold;">Condition:</td>
                            <td style="padding:8px; color:#7c3aed; font-weight:bold;">%s</td></tr>
                        <tr><td style="padding:8px; font-weight:bold;">Reported By:</td>
                            <td style="padding:8px;">%s</td></tr>
                        <tr style="background:#f5f3ff;">
                            <td style="padding:8px; font-weight:bold;">Description:</td>
                            <td style="padding:8px;">%s</td></tr>
                      </table>
                      <p style="margin-top:20px;">Please review and take appropriate action.</p>
                      <p style="color:#9ca3af; font-size:12px;">AssetTrack — Automated Notification</p>
                    </div>
                  </body>
                </html>
                """.formatted(name, serial, conditionStatus, reporterName, description);
    }
}
