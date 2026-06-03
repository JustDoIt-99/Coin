package com.sangyunpark.backend.auth.repositiory;

import com.sangyunpark.backend.auth.entity.RefreshToken;
import com.sangyunpark.backend.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface RefreshTokenJpaRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByToken(String token);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("delete from RefreshToken rt where rt.user = :user")
    void deleteByUser(@Param("user") User user);
}
