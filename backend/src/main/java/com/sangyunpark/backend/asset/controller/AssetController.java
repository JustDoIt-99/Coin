package com.sangyunpark.backend.asset.controller;

import com.sangyunpark.backend.asset.controller.dto.response.AssetResponse;
import com.sangyunpark.backend.asset.service.AssetService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
public class AssetController {

    private static final String USER_ID = "userId";

    private final AssetService assetService;

    @GetMapping
    public List<AssetResponse> getAssets(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute(USER_ID);
        return assetService.getAssets(userId);
    }
}
