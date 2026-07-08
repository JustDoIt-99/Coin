package com.sangyunpark.backend.user.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 254)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, length = 20)
    private String nickname;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserRole role;

    @Builder
    private User(
            String email,
            String password,
            String nickname,
            UserRole role
    ) {
        this.email = email;
        this.password = password;
        this.nickname = nickname;
        this.role = role == null ? UserRole.USER : role;
    }

    @PrePersist
    private void prePersist() {
        if (role == null) {
            role = UserRole.USER;
        }
    }
}
