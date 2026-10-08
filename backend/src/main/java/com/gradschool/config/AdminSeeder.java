package com.gradschool.config;

import com.gradschool.auth.AdminUser;
import com.gradschool.auth.AdminUserRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/** 관리자 계정이 없을 때만 환경변수(ADMIN_USERNAME / ADMIN_PASSWORD)로 최초 1회 생성한다. */
@Component
public class AdminSeeder implements ApplicationRunner {
    private final AdminUserRepository repo;
    private final PasswordEncoder encoder;
    private final AppProperties props;

    public AdminSeeder(AdminUserRepository repo, PasswordEncoder encoder, AppProperties props) {
        this.repo = repo; this.encoder = encoder; this.props = props;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (repo.count() == 0) repo.save(new AdminUser(props.adminUsername(), encoder.encode(props.adminPassword())));
    }
}
