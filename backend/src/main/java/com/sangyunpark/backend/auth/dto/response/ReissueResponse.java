package com.sangyunpark.backend.auth.dto.response;

import com.sangyunpark.backend.user.dto.response.UserResponse;

public record ReissueResponse(
        String accessToken,
        UserResponse user
) {
}
