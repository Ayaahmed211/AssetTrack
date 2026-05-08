package com.assettrack.backend.scheduler;

import com.assettrack.backend.domain.Asset;
import com.assettrack.backend.domain.Role;
import com.assettrack.backend.domain.User;
import com.assettrack.backend.repository.AssetRepository;
import com.assettrack.backend.repository.UserRepository;
import com.assettrack.backend.service.EmailService;
import com.assettrack.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Scheduled task that runs daily at 08:00 to:
 *
 *  1. Find all assets with warranties expiring within the next 30 days
 *     → Create in-app notification + send email to all ADMIN and MANAGER users.
 *
 *  2. Find all assets with already-expired warranties
 *     → Create in-app notification + send email to all ADMIN and MANAGER users.
 *
 * Duplicate notifications are suppressed by NotificationService.isDuplicate().
 * Emails are sent asynchronously via @Async in EmailService.
 *
 * Enable: @EnableScheduling is placed on BackendApplication.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class WarrantyScheduler {

    private static final int WARRANTY_WARN_DAYS = 30;

    private final AssetRepository assetRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    // ── Run daily at 08:00 server time ─────────────────────────────────────────

    /**
     * Check for warranties expiring within the next 30 days.
     * Cron: seconds minutes hours day-of-month month day-of-week
     */
    @Scheduled(cron = "0 0 8 * * *")
    public void checkExpiringSoon() {
        log.info("[WarrantyScheduler] Running expiring-soon check...");
        LocalDate today     = LocalDate.now();
        LocalDate threshold = today.plusDays(WARRANTY_WARN_DAYS);

        List<Asset> expiringSoon =
                assetRepository.findByWarrantyExpirationDateBetween(today, threshold);

        if (expiringSoon.isEmpty()) {
            log.info("[WarrantyScheduler] No assets expiring within {} days.", WARRANTY_WARN_DAYS);
            return;
        }

        List<User> recipients = getAdminsAndManagers();
        log.info("[WarrantyScheduler] {} asset(s) expiring soon. Notifying {} recipient(s).",
                expiringSoon.size(), recipients.size());

        for (Asset asset : expiringSoon) {
            long daysLeft = ChronoUnit.DAYS.between(today, asset.getWarrantyExpirationDate());
            for (User admin : recipients) {
                // In-app notification (skips duplicates)
                notificationService.createWarrantyExpiringSoonNotification(
                        admin, asset.getSerialNumber(), daysLeft);
                // Async email
                emailService.sendWarrantyExpiringSoonAlert(
                        admin.getEmail(),
                        admin.getFullName(),
                        asset.getSerialNumber(),
                        daysLeft);
            }
            log.info("[WarrantyScheduler] Warranty EXPIRING_SOON: {} ({} days left)",
                    asset.getSerialNumber(), daysLeft);
        }
    }

    /**
     * Check for warranties that have already expired.
     * Runs 1 minute after the expiring-soon check.
     */
    @Scheduled(cron = "0 1 8 * * *")
    public void checkExpired() {
        log.info("[WarrantyScheduler] Running expired warranty check...");
        LocalDate today = LocalDate.now();

        List<Asset> expired = assetRepository.findByWarrantyExpirationDateBefore(today);

        if (expired.isEmpty()) {
            log.info("[WarrantyScheduler] No expired warranties found.");
            return;
        }

        List<User> recipients = getAdminsAndManagers();
        log.info("[WarrantyScheduler] {} asset(s) with expired warranties. Notifying {} recipient(s).",
                expired.size(), recipients.size());

        for (Asset asset : expired) {
            long daysExpired = ChronoUnit.DAYS.between(asset.getWarrantyExpirationDate(), today);
            for (User admin : recipients) {
                notificationService.createWarrantyExpiredNotification(
                        admin, asset.getSerialNumber(), daysExpired);
                emailService.sendWarrantyExpiredAlert(
                        admin.getEmail(),
                        admin.getFullName(),
                        asset.getSerialNumber(),
                        daysExpired);
            }
            log.info("[WarrantyScheduler] Warranty EXPIRED: {} ({} days ago)",
                    asset.getSerialNumber(), daysExpired);
        }
    }

    // ── Private helpers ────────────────────────────────────────────────────────

    /**
     * Retrieve all ADMIN and MANAGER users who should receive warranty alerts.
     */
    private List<User> getAdminsAndManagers() {
        List<User> admins   = userRepository.findByRole(Role.ADMIN);
        List<User> managers = userRepository.findByRole(Role.MANAGER);
        admins.addAll(managers);
        return admins;
    }
}
