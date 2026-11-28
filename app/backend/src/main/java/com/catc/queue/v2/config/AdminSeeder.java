package com.catc.queue.v2.config;

import com.catc.queue.v2.dto.CreateAdminRequest;
import com.catc.queue.v2.repository.AdminRepository;
import com.catc.queue.v2.service.AccountService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** Creates the first admin on startup if none exists. Set catc.admin.* in application.properties. */
@Configuration
public class AdminSeeder {

    @Bean
    CommandLineRunner catcAdminSeed(AdminRepository admins, AccountService accounts,
                                    @Value("${catc.admin.email:admin@catc.local}") String email,
                                    @Value("${catc.admin.password:ChangeMe123!}") String password) {
        return args -> {
            if (admins.count() == 0) accounts.createAdmin(new CreateAdminRequest("System Admin", email, password));
        };
    }
}
