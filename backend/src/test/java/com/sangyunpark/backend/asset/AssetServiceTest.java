package com.sangyunpark.backend.asset;

import com.sangyunpark.backend.asset.controller.dto.response.AssetResponse;
import com.sangyunpark.backend.asset.service.AssetService;
import com.sangyunpark.backend.auth.dto.request.SignupRequest;
import com.sangyunpark.backend.auth.dto.response.AuthTokenResponse;
import com.sangyunpark.backend.auth.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class AssetServiceTest {

    @Autowired
    AssetService assetService;

    @Autowired
    AuthService authService;

    @Test
    void 내_자산_목록을_조회한다() {
        AuthTokenResponse signupResponse = authService.signup(new SignupRequest(
                "test@test.com",
                "12345678",
                "sangyun"
        ));

        List<AssetResponse> responses = assetService.getAssets(signupResponse.user().id());

        assertThat(responses)
                .hasSize(1)
                .first()
                .satisfies(response -> {
                    assertThat(response.assetCode()).isEqualTo("KRW");
                    assertThat(response.balance()).isEqualByComparingTo(new BigDecimal("1000000"));
                    assertThat(response.averageBuyPrice()).isEqualByComparingTo(BigDecimal.ZERO);
                });
    }
}
