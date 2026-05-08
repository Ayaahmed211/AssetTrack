package com.assettrack.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * AssetTrack Spring Boot entry point.
 *
 * @EnableScheduling — activates WarrantyScheduler (@Scheduled cron jobs).
 * @EnableAsync      — activates @Async on EmailService (non-blocking email sends).
 */
@SpringBootApplication
@EnableScheduling
@EnableAsync
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

}
